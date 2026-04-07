# Step 1: Use Node.js as the base image
FROM node:20-slim

# Step 2: Install Python and its dependencies (Needed for ML models)
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Step 3: Create a Python virtual environment and install ML libraries
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"
RUN pip install pandas numpy joblib scikit-learn xgboost

# Step 4: Set the working directory
WORKDIR /app

# Step 5: Copy the entire project into the container
COPY . .

# Step 6: Go into the frontend folder and install Node dependencies
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Step 7: Expose the port (Render uses process.env.PORT)
EXPOSE 3000

# Step 8: Start the integrated Node + Python server
CMD ["npm", "start"]

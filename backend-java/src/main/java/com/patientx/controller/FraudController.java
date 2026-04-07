package com.patientx.controller;

import org.springframework.web.bind.annotation.*;
import java.io.*;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") 
public class FraudController {

    @PostMapping("/predict-fraud")
    public String predictFraud(@RequestBody String payload) {
        StringBuilder output = new StringBuilder();
        try {
            // Path to your Python script relative to backend root (hack/)
            // Since this runs in backend-java/ the script is at ../predict_single.py
            String scriptPath = Paths.get("..", "predict_single.py").toAbsolutePath().normalize().toString();
            
            ProcessBuilder pb = new ProcessBuilder("python", scriptPath);
            pb.redirectErrorStream(true);
            Process p = pb.start();

            // Send payload to Python's stdin
            try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(p.getOutputStream()))) {
                writer.write(payload);
                writer.flush();
            }

            // Read Python's stdout (the AI prediction)
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(p.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line);
                }
            }
            
            p.waitFor();
            return output.toString();
        } catch (Exception e) {
            return "{\"error\": \"Java Backend Error: " + e.getMessage() + "\"}";
        }
    }
}

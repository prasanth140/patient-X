import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export const generateReceiptBlob = async (order: any): Promise<string> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Header
  doc.setFillColor(14, 165, 233); // Sky-500
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('PATIENT-X PHARMACY', 20, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Premium Medical Care & Healthcare Essentials', 20, 32);

  // Order Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL RECEIPT', 20, 60);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Order ID: ${order.orderId}`, 20, 70);
  doc.text(`Date: ${new Date().toLocaleString()}`, 20, 75);
  doc.text(`Customer: ${order.customerName}`, 20, 80);
  doc.text(`Email: ${order.customerEmail}`, 20, 85);

  // Table Header
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.rect(20, 95, 170, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Item', 25, 101);
  doc.text('Qty', 120, 101);
  doc.text('Price', 150, 101);
  doc.text('Total', 175, 101);

  // Items
  let y = 112;
  doc.setFont('helvetica', 'normal');
  order.items.forEach((item: any) => {
    doc.text(item.name, 25, y);
    doc.text(item.quantity.toString(), 120, y);
    doc.text(`₹${item.price}`, 150, y);
    doc.text(`₹${item.price * item.quantity}`, 175, y);
    y += 8;
  });

  // Total
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.line(20, y, 190, y);
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Total Amount Paid:', 120, y);
  doc.text(`₹${order.total}`, 175, y);

  // QR Code for Verification
  try {
    const qrData = JSON.stringify({
      id: order.orderId,
      customer: order.customerName,
      total: order.total,
      verified: true
    });
    const qrDataUrl = await QRCode.toDataURL(qrData);
    doc.addImage(qrDataUrl, 'PNG', 20, y - 10, 40, 40);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Scan to verify receipt', 20, y + 35);
  } catch (e) {
    console.error("QR Error", e);
  }

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for choosing Patient-X Pharmacy.', 105, 280, { align: 'center' });
  doc.text('This is a computer-generated receipt.', 105, 285, { align: 'center' });

  return doc.output('datauristring');
};

export const downloadReceipt = async (order: any) => {
  const dataUrl = await generateReceiptBlob(order);
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `Receipt-${order.orderId}.pdf`;
  link.click();
};

import jsPDF from 'jspdf';

export class PDFService {
  static generateOrderPDF(order, isAdmin = false) {
    const pdf = new jsPDF();
    
    // Set up fonts and colors
    pdf.setFont('helvetica');
    
    // Header
    pdf.setFontSize(20);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Burtong E-commerce', 20, 25);
    
    pdf.setFontSize(16);
    pdf.text('Order Receipt', 20, 40);
    
    // Order Info
    pdf.setFontSize(12);
    pdf.text(`Order ID: #${order.id}`, 20, 55);
    pdf.text(`Date: ${new Date(order.orderDate).toLocaleDateString()}`, 20, 65);
    pdf.text(`Status: ${order.status}`, 20, 75);
    
    if (order.customer) {
      pdf.text(`Customer: ${order.customer.username}`, 20, 85);
    }
    
    // Line separator
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, 95, 190, 95);
    
    // Items header
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Item', 20, 110);
    pdf.text('Qty', 120, 110);
    pdf.text('Price', 140, 110);
    pdf.text('Total', 165, 110);
    
    pdf.line(20, 113, 190, 113);
    
    // Items
    pdf.setFont('helvetica', 'normal');
    let yPosition = 125;
    let subtotal = 0;
    
    order.orderItems.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      
      // Handle long product names
      const productName = item.product.name.length > 25 
        ? item.product.name.substring(0, 25) + '...' 
        : item.product.name;
      
      pdf.text(productName, 20, yPosition);
      pdf.text(item.quantity.toString(), 120, yPosition);
      pdf.text(`$${item.price.toFixed(2)}`, 140, yPosition);
      pdf.text(`$${itemTotal.toFixed(2)}`, 165, yPosition);
      
      yPosition += 10;
    });
    
    // Totals section
    yPosition += 10;
    pdf.line(20, yPosition, 190, yPosition);
    yPosition += 15;
    
    pdf.text(`Subtotal:`, 120, yPosition);
    pdf.text(`$${subtotal.toFixed(2)}`, 165, yPosition);
    yPosition += 10;
    
    // Discount if applicable
    if (order.coupon) {
      const discountAmount = subtotal - order.totalPrice;
      pdf.text(`Discount (${order.coupon.code}):`, 120, yPosition);
      pdf.text(`-$${discountAmount.toFixed(2)}`, 165, yPosition);
      yPosition += 10;
    }
    
    // Final total
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Total:`, 120, yPosition);
    pdf.text(`$${order.totalPrice.toFixed(2)}`, 165, yPosition);
    
    // Footer
    yPosition += 30;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(128, 128, 128);
    pdf.text('Thank you for your business!', 20, yPosition);
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, yPosition + 10);
    
    return pdf;
  }
  
  static downloadOrderPDF(order, isAdmin = false) {
    const pdf = this.generateOrderPDF(order, isAdmin);
    const filename = `order-${order.id}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
  }
  
  static printOrderPDF(order, isAdmin = false) {
    const pdf = this.generateOrderPDF(order, isAdmin);
    
    // Create blob URL for better browser compatibility
    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    // Create print window with better styling
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Order #${order.id} - Print</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                fontFamily: Arial, sans-serif;
              }
              .print-container {
                width: 100%;
                height: 100vh;
                display: flex;
                flexDirection: column;
              }
              .print-header {
                backgroundColor: #f8f9fa;
                padding: 10px 20px;
                borderBottom: 1px solid #ddd;
                display: flex;
                justifyContent: space-between;
                alignItems: center;
              }
              .print-btn {
                backgroundColor: #007bff;
                color: white;
                border: none;
                padding: 8px 16px;
                borderRadius: 4px;
                cursor: pointer;
                fontSize: 14px;
              }
              .print-btn:hover {
                backgroundColor: #0056b3;
              }
              iframe {
                flex: 1;
                border: none;
              }
              @media print {
                .print-header { display: none; }
                iframe { height: 100vh; }
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              <div class="print-header">
                <h3>Order #${order.id} - Ready to Print</h3>
                <button class="print-btn" onclick="window.print()">Print</button>
              </div>
              <iframe src="${pdfUrl}" width="100%" height="100%"></iframe>
            </div>
            
            <script>
              // Auto-focus for better UX
              window.focus();
              
              // Clean up blob URL when window closes
              window.addEventListener('beforeunload', function() {
                URL.revokeObjectURL('${pdfUrl}');
              });
              
              // Optional: Auto-print after PDF loads
              setTimeout(function() {
                const iframe = document.querySelector('iframe');
                iframe.onload = function() {
                  // Uncomment next line for auto-print
                  // window.print();
                };
              }, 500);
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      // Fallback: download PDF if popup blocked
      this.downloadOrderPDF(order, isAdmin);
      alert('Popup blocked. PDF downloaded instead. Please check your downloads folder.');
    }
  }
}
/**
 * ================================================================
 * RECEIPT PDF GENERATOR - BIZCONTROL 360 ERP v2.0.0
 * ================================================================
 * Geração de recibos de venda em PDF
 * 
 * CONFORME LEGISLAÇÃO MOÇAMBIQUE:
 * - Nome da empresa + NUIT
 * - Data e hora da venda
 * - Produtos vendidos
 * - IVA discriminado (17%)
 * - Total em Meticais (MT)
 * 
 * AUTOR: Finance Team
 * DATA: 18 Dezembro 2025
 * ================================================================
 */

"use server";

import { Prisma } from "@prisma/client";
import { fromDecimal } from "./decimal-helpers";

interface ReceiptData {
  sale: {
    id: string;
    subtotal: Prisma.Decimal;
    discount_amount: Prisma.Decimal | null;
    tax_amount: Prisma.Decimal | null;
    total: Prisma.Decimal;
    payment_method: string;
    created_at: Date;
    company: {
      name: string;
      nuit: string | null;
      address: string | null;
      phone: string | null;
    };
    employee: {
      full_name: string;
    };
    sale_items: Array<{
      product_name: string;
      quantity: number;
      unit_price: Prisma.Decimal;
      subtotal: Prisma.Decimal;
    }>;
  };
}

export async function generateReceiptHTML(data: ReceiptData): Promise<string> {
  const { sale } = data;

  const subtotal = fromDecimal(sale.subtotal);
  const discount = sale.discount_amount ? fromDecimal(sale.discount_amount) : 0;
  const tax = sale.tax_amount ? fromDecimal(sale.tax_amount) : 0;
  const total = fromDecimal(sale.total);

  const dateStr = new Date(sale.created_at).toLocaleDateString('pt-MZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const paymentMethodLabels: Record<string, string> = {
    DINHEIRO: "Dinheiro",
    MPESA: "M-Pesa",
    EMOLA: "E-Mola",
    CARTAO: "Cartão",
    MULTICAIXA: "Multicaixa",
    TRANSFERENCIA: "Transferência"
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recibo #${sale.id.slice(-8).toUpperCase()}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.4;
      color: #000;
      background: #fff;
      padding: 20px;
      max-width: 350px;
      margin: 0 auto;
    }
    
    .receipt {
      border: 2px dashed #000;
      padding: 15px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 15px;
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
    }
    
    .company-name {
      font-size: 18px;
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    
    .company-info {
      font-size: 10px;
      color: #333;
    }
    
    .receipt-title {
      font-size: 16px;
      font-weight: bold;
      text-align: center;
      margin: 15px 0;
      text-transform: uppercase;
    }
    
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      font-size: 11px;
    }
    
    .items {
      margin: 15px 0;
      border-top: 1px dashed #000;
      border-bottom: 1px dashed #000;
      padding: 10px 0;
    }
    
    .item {
      margin-bottom: 8px;
    }
    
    .item-name {
      font-weight: bold;
      margin-bottom: 2px;
    }
    
    .item-details {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #333;
    }
    
    .totals {
      margin-top: 15px;
    }
    
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      font-size: 11px;
    }
    
    .total-row.final {
      font-size: 14px;
      font-weight: bold;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 2px solid #000;
    }
    
    .footer {
      margin-top: 20px;
      text-align: center;
      font-size: 10px;
      color: #666;
      border-top: 1px dashed #000;
      padding-top: 10px;
    }
    
    .footer-line {
      margin: 5px 0;
    }
    
    @media print {
      body {
        padding: 0;
      }
      
      .receipt {
        border: none;
      }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <!-- Header -->
    <div class="header">
      <div class="company-name">${sale.company.name}</div>
      ${sale.company.nuit ? `<div class="company-info">NUIT: ${sale.company.nuit}</div>` : ''}
      ${sale.company.address ? `<div class="company-info">${sale.company.address}</div>` : ''}
      ${sale.company.phone ? `<div class="company-info">Tel: ${sale.company.phone}</div>` : ''}
    </div>
    
    <!-- Receipt Title -->
    <div class="receipt-title">Recibo de Venda</div>
    
    <!-- Info -->
    <div class="info-row">
      <span>Nº:</span>
      <span><strong>#${sale.id.slice(-8).toUpperCase()}</strong></span>
    </div>
    <div class="info-row">
      <span>Data:</span>
      <span>${dateStr}</span>
    </div>
    <div class="info-row">
      <span>Vendedor:</span>
      <span>${sale.employee.full_name}</span>
    </div>
    <div class="info-row">
      <span>Pagamento:</span>
      <span>${paymentMethodLabels[sale.payment_method] || sale.payment_method}</span>
    </div>
    
    <!-- Items -->
    <div class="items">
      ${sale.sale_items.map(item => {
        const itemPrice = fromDecimal(item.unit_price);
        const itemSubtotal = fromDecimal(item.subtotal);
        return `
          <div class="item">
            <div class="item-name">${item.product_name}</div>
            <div class="item-details">
              <span>${item.quantity} x ${itemPrice.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT</span>
              <span>${itemSubtotal.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
    
    <!-- Totals -->
    <div class="totals">
      <div class="total-row">
        <span>Subtotal:</span>
        <span>${subtotal.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT</span>
      </div>
      
      ${discount > 0 ? `
        <div class="total-row">
          <span>Desconto:</span>
          <span>-${discount.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT</span>
        </div>
      ` : ''}
      
      ${tax > 0 ? `
        <div class="total-row">
          <span>IVA (17%):</span>
          <span>${tax.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT</span>
        </div>
      ` : ''}
      
      <div class="total-row final">
        <span>TOTAL:</span>
        <span>${total.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT</span>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="footer-line">Obrigado pela sua preferência!</div>
      <div class="footer-line">BizControl 360 - Sistema ERP</div>
      <div class="footer-line">www.bizcontrol360.com</div>
    </div>
  </div>
  
  <script>
    // Auto-print on load
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
  `;

  return html;
}

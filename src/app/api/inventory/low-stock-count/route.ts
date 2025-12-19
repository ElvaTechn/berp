import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { db } from '@/lib/server-api';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ count: 0 }, { status: 401 });

    // Buscar employee para obter company_id
    const employees = await db.employee.list({ email: session.email });
    const employee = employees[0];

    if (!employee?.company_id) {
      return NextResponse.json({ count: 0 });
    }

    // Contar produtos com stock baixo
    const products = await db.product.list(employee.company_id, {
      quantity: { lte: 10 } // Temporarily hardcoded, will improve
    });

    // Filtrar produtos onde quantity <= min_stock
    const lowStockCount = products.filter(product => 
      product.quantity <= product.min_stock
    ).length;

    return NextResponse.json({ count: lowStockCount });

  } catch (error) {
    console.error('Error fetching low stock count:', error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
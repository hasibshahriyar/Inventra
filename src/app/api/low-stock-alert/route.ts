import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { product_name, stock, user_id } = body;

    if (!product_name || stock === undefined || !user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Initialize Supabase client with Anon Key
    // We pass the Authorization header so RLS policies are evaluated correctly
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const isOutOfStock = stock === 0;
    const title = isOutOfStock ? 'Product Out of Stock' : 'Low Stock Alert';
    const message = isOutOfStock
      ? `🚨 ALERT: "${product_name}" is OUT OF STOCK!`
      : `⚠️ WARNING: "${product_name}" is running low on stock (${stock} remaining).`;
    const type = isOutOfStock ? 'danger' : 'warning';

    // Insert the notification into the database
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id,
        title,
        message,
        type,
        is_read: false
      })
      .select()
      .single();

    if (error) {
      console.error('[API] Error inserting notification:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[API] Serverless function error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

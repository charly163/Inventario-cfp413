import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const result = await sql`SELECT NOW() as moment`;
        return NextResponse.json({
            status: 'connected',
            time: result[0].moment,
            env_db_url_set: !!(process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL),
            using_prefixed_var: !!process.env.NETLIFY_DATABASE_URL,
            available_env_vars: Object.keys(process.env).filter(k => !k.includes('SECRET') && !k.includes('KEY') && !k.includes('TOKEN'))
        });
    } catch (e: any) {
        console.error('Database diagnostic failure:', e);
        return NextResponse.json({
            status: 'error',
            message: e.message,
            env_db_url_set: !!process.env.DATABASE_URL,
            available_env_vars: Object.keys(process.env).filter(k => !k.includes('SECRET') && !k.includes('KEY') && !k.includes('TOKEN'))
        }, { status: 500 });
    }
}

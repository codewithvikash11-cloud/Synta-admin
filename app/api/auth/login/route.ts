import { NextResponse } from 'next/server';
import { login } from '@/lib/auth';
import type { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

        if (!adminEmail || !adminPasswordHash) {
            return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
        }

        if (email !== adminEmail) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const passwordsMatch = await bcrypt.compare(password, adminPasswordHash);

        if (!passwordsMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        await login(email);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

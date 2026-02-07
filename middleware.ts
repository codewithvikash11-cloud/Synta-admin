import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    // 1. Update session if it exists (extend expiry)
    await updateSession(request);

    const session = request.cookies.get('session')?.value;
    const path = request.nextUrl.pathname;

    const isPublicPath = path === '/login';

    // 2. Protect protected routes
    if (!isPublicPath && !session) {
        if (path.startsWith('/dashboard') || path.startsWith('/errors') || path === '/') {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        // Also protect API routes (except auth)
        if (path.startsWith('/api') && !path.startsWith('/api/auth')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    // 3. Redirect to dashboard if logged in and trying to access login
    if (isPublicPath && session) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};

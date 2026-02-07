import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import ErrorModel from '@/lib/models/Error';
import { createSlug } from '@/lib/slugify';

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await connectToDatabase();
        const body = await request.json();
        const { id, title, explanation, rootCause, fixedCode, prevention, status } = body;

        // Validation
        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        const updateData: any = {
            'aiSolution.title': title,
            'aiSolution.explanation': explanation,
            'aiSolution.rootCause': rootCause,
            'aiSolution.fixedCode': fixedCode,
            'aiSolution.prevention': prevention,
            status: status
        };

        if (status === 'PUBLISHED') {
            if (!title) {
                return NextResponse.json({ error: 'Title required for publishing' }, { status: 400 });
            }
            const slug = createSlug(title);
            updateData.formattedSlug = slug;
            updateData.publishedAt = new Date();
        }

        const result = await ErrorModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        return NextResponse.json({ success: true, data: result });
    } catch (e) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

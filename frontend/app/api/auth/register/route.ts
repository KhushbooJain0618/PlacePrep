import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '@/server/models/User';
import { isSupabaseConnected, areSupabaseTablesReady } from '@/server/config/supabase';
import { generateToken, formatUser, mockUsers } from '@/server/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, email, password, targetRole, collegeYear } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // If Supabase is connected but tables haven't been run
    if (isSupabaseConnected() && !areSupabaseTablesReady()) {
      return NextResponse.json(
        {
          error: 'DatabaseSchemaMissing',
          message: "Supabase database tables are not initialized yet. Please execute 'supabase-schema.sql' in your Supabase SQL Editor.",
        },
        { status: 503 }
      );
    }

    // Persist to Supabase if connected
    if (isSupabaseConnected() && areSupabaseTablesReady()) {
      try {
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
          return NextResponse.json(
            { error: 'UserExists', message: 'An account with this email address already exists' },
            { status: 400 }
          );
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
          name: name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          targetRole: targetRole || 'Software Engineer',
          collegeYear: collegeYear || 'Final Year (Class of 2026)',
          preparationProgress: 0,
          dailyStreak: 1,
          interviewsCompleted: 0,
          topicsCovered: 0,
        });

        const token = generateToken({
          userId: user.id,
          email: user.email,
          name: user.name,
          targetRole: user.targetRole,
        });

        return NextResponse.json(
          {
            message: 'Account created successfully',
            token,
            user: formatUser(user),
          },
          { status: 201 }
        );
      } catch (dbErr: any) {
        console.warn('[Auth Register] Supabase create error:', dbErr.message);
        return NextResponse.json(
          {
            error: 'RegistrationFailed',
            message: dbErr.message || 'Failed to persist account to database. Please check Supabase schema.',
          },
          { status: 500 }
        );
      }
    }

    // Fallback: In-memory mock storage
    if (mockUsers.has(normalizedEmail)) {
      return NextResponse.json(
        { error: 'UserExists', message: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const fallbackUser = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      targetRole: targetRole || 'Software Engineer',
      collegeYear: collegeYear || 'Final Year (Class of 2026)',
      preparationProgress: 0,
      dailyStreak: 1,
      interviewsCompleted: 0,
      topicsCovered: 0,
    };

    mockUsers.set(normalizedEmail, fallbackUser);

    const token = generateToken({
      userId: fallbackUser.id,
      email: fallbackUser.email,
      name: fallbackUser.name,
      targetRole: fallbackUser.targetRole,
    });

    return NextResponse.json(
      {
        message: 'Account created successfully',
        token,
        user: formatUser(fallbackUser),
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('[Auth Register Error]:', err);
    return NextResponse.json(
      { error: 'RegistrationFailed', message: err.message || 'Failed to create account' },
      { status: 500 }
    );
  }
}

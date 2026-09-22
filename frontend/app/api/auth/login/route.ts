import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { User } from '@/server/models/User';
import { isSupabaseConnected, areSupabaseTablesReady } from '@/server/config/supabase';
import { generateToken, formatUser, mockUsers } from '@/server/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if Supabase is connected but tables haven't been run
    if (isSupabaseConnected() && !areSupabaseTablesReady()) {
      return NextResponse.json(
        {
          error: 'DatabaseSchemaMissing',
          message: "Supabase database tables are not initialized yet. Please execute 'supabase-schema.sql' in your Supabase SQL Editor.",
        },
        { status: 503 }
      );
    }

    // Verify against Supabase if active
    if (isSupabaseConnected() && areSupabaseTablesReady()) {
      try {
        const user = await User.findOne({ email: normalizedEmail });
        if (user && user.password) {
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return NextResponse.json(
              { error: 'InvalidCredentials', message: 'Invalid email or password' },
              { status: 401 }
            );
          }

          const token = generateToken({
            userId: user.id,
            email: user.email,
            name: user.name,
            targetRole: user.targetRole,
          });

          return NextResponse.json({
            message: 'Sign in successful',
            token,
            user: formatUser(user),
          });
        }
      } catch (dbErr: any) {
        console.warn('[Auth Login] Supabase error:', dbErr.message);
      }
    }

    // Fallback: Verify against in-memory mock users (demo mode or offline DB)
    const mockUser = mockUsers.get(normalizedEmail);
    if (mockUser) {
      const isMatch = await bcrypt.compare(password, mockUser.password);
      if (!isMatch) {
        return NextResponse.json(
          { error: 'InvalidCredentials', message: 'Invalid email or password' },
          { status: 401 }
        );
      }

      const token = generateToken({
        userId: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        targetRole: mockUser.targetRole,
      });

      return NextResponse.json({
        message: 'Sign in successful',
        token,
        user: formatUser(mockUser),
      });
    }

    return NextResponse.json(
      {
        error: 'InvalidCredentials',
        message: 'No account found with this email. Please check your credentials or create an account.',
      },
      { status: 401 }
    );

    const token = generateToken({
      userId: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      targetRole: mockUser.targetRole,
    });

    return NextResponse.json({
      message: 'Sign in successful',
      token,
      user: formatUser(mockUser),
    });
  } catch (err: any) {
    console.error('[Auth Login Error]:', err);
    return NextResponse.json(
      { error: 'LoginFailed', message: err.message || 'Failed to sign in' },
      { status: 500 }
    );
  }
}

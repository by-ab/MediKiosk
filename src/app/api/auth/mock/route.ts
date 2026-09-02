import { NextRequest, NextResponse } from 'next/server';
import { createPatientRecord } from '@/lib/store';
import { AuthMethod } from '@/lib/types';

/**
 * SIMULATED AUTHENTICATION LAYER
 * This function simulates government ABHA (Ayushman Bharat Health Account) OTP verification
 * and rapid hospital guest check-in without calling live government production endpoints.
 */
function simulateAbhaAuth(abhaId: string, otp: string): { success: boolean; error?: string; mockProfile?: { name: string; age: string; gender: string; phone: string } } {
  // Simple validation for 14-digit format: 14-XXXX-XXXX-XXXX or 14 digits
  const cleanAbha = abhaId.replace(/[^0-9]/g, '');
  if (cleanAbha.length !== 14) {
    return { success: false, error: 'ABHA ID must be exactly 14 digits (e.g. 14-1234-5678-9012)' };
  }

  // Demo simulated OTP: accept 123456 or any 6-digit OTP
  if (!otp || otp.length !== 6) {
    return { success: false, error: 'Please enter a valid 6-digit OTP (Demo code: 123456)' };
  }

  // Return a realistic mock demographic profile associated with this ABHA
  return {
    success: true,
    mockProfile: {
      name: 'Aarav Patel',
      age: '38',
      gender: 'Male',
      phone: '+91 98201 54321',
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { authMethod, abhaId, otp, name, phone, age, gender } = body as {
      authMethod: AuthMethod;
      abhaId?: string;
      otp?: string;
      name?: string;
      phone?: string;
      age?: string;
      gender?: string;
    };

    let patientName = name || 'Anonymous Patient';
    let patientPhone = phone || '+91 99999 00000';
    let patientAge = age || '35';
    let patientGender = gender || 'Not Specified';
    let formattedAbhaId = abhaId;

    if (authMethod === 'abha') {
      if (!abhaId) {
        return NextResponse.json({ error: 'ABHA ID is required' }, { status: 400 });
      }

      const authResult = simulateAbhaAuth(abhaId, otp || '123456');
      if (!authResult.success) {
        return NextResponse.json({ error: authResult.error }, { status: 400 });
      }

      if (authResult.mockProfile) {
        patientName = name || authResult.mockProfile.name;
        patientPhone = phone || authResult.mockProfile.phone;
        patientAge = age || authResult.mockProfile.age;
        patientGender = gender || authResult.mockProfile.gender;
      }

      // Format as 14-XXXX-XXXX-XXXX if not formatted
      const digits = abhaId.replace(/[^0-9]/g, '');
      formattedAbhaId = `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}-${digits.slice(10, 14)}`;
    } else {
      // New Patient Registration without ABHA
      if (!name || !phone) {
        return NextResponse.json({ error: 'Name and Phone number are required for registration' }, { status: 400 });
      }
    }

    const record = createPatientRecord({
      patientInfo: {
        name: patientName,
        phone: patientPhone,
        abhaId: formattedAbhaId,
        age: patientAge,
        gender: patientGender,
        authMethod: authMethod || 'phone_register',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Patient check-in verified successfully',
      token: record.token,
      tokenNumber: record.tokenNumber,
      patientInfo: record.patientInfo,
      firstMessage: record.messages[0],
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

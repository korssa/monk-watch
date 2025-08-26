import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function DELETE(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url || !url.startsWith('/uploads/')) {
      return NextResponse.json(
        { error: 'Invalid file URL' },
        { status: 400 }
      );
    }

    console.log('🗑️ 개별 파일 삭제 시작:', url);

    // 파일 경로 구성
    const filePath = path.join(process.cwd(), 'public', url);
    
    try {
      await fs.unlink(filePath);
      console.log('✅ 파일 삭제 완료:', url);
      
      return NextResponse.json({ 
        success: true, 
        message: `File ${url} deleted successfully` 
      });
      
    } catch (error) {
      if ((error as { code?: string }).code === 'ENOENT') {
        console.log('⚠️ 파일이 이미 없음:', url);
        // 파일이 없어도 성공으로 처리
        return NextResponse.json({ 
          success: true, 
          message: `File ${url} was already deleted` 
        });
      }
      
      throw error;
    }

  } catch (error) {
    console.error('❌ 파일 삭제 실패:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete file',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

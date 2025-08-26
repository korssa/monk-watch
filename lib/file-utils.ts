export const saveFileToLocal = async (file: File, prefix: string = ""): Promise<string> => {
  try {
    const storageType = process.env.NEXT_PUBLIC_STORAGE_TYPE || 'local';
    
    console.log('📤 파일 업로드 시작:', { 
      name: file.name, 
      size: file.size, 
      prefix,
      storageType 
    });

    if (storageType === 'vercel-blob') {
      // Vercel Blob Storage 사용
      const { uploadFile } = await import('./storage-adapter');
      const url = await uploadFile(file, prefix);
      console.log('✅ Vercel Blob 업로드 완료:', url);
      return url;
    } else {
      // 로컬 저장소 사용 (기본값)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('prefix', prefix);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }
      
      console.log('✅ 로컬 업로드 완료:', result.url);
      return result.url; // /uploads/filename 형태의 상대 경로 반환
    }
    
  } catch (error) {
    console.error('❌ 파일 업로드 실패:', error);
    
    // 실패시 임시 Object URL로 폴백 (미리보기용)
    console.log('⚠️ Object URL로 폴백');
    const objectUrl = URL.createObjectURL(file);
    
    // 메모리 누수 방지를 위해 1분 후 해제
    setTimeout(() => {
      try {
        URL.revokeObjectURL(objectUrl);
        console.log('🗑️ Object URL 자동 해제:', objectUrl);
      } catch (e) {
        // 해제 실패 무시
      }
    }, 60000);
    
    return objectUrl;
  }
};

export const deleteLocalFile = async (url: string): Promise<boolean> => {
  try {
    console.log('🗑️ 파일 삭제 시작:', url);

    // Vercel Blob URL인 경우
    if (url.includes('vercel-storage.com') || url.includes('blob.vercel-storage.com')) {
      console.log('🗑️ Vercel Blob 파일 삭제:', url);
      const { deleteFile } = await import('./storage-adapter');
      return await deleteFile(url);
    }
    
    // /uploads/ 경로로 시작하는 로컬 서버 파일인 경우
    if (url.startsWith('/uploads/')) {
      console.log('🗑️ 로컬 서버 파일 삭제:', url);
      
      const response = await fetch('/api/delete-file', {
        method: 'DELETE',
        body: JSON.stringify({ url }),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const result = response.ok;
      console.log(result ? '✅ 로컬 파일 삭제 완료' : '❌ 로컬 파일 삭제 실패', url);
      return result;
    }
    
    // Object URL인 경우 (blob: 로 시작)
    if (url.startsWith('blob:')) {
      console.log('🗑️ Object URL 해제:', url);
      URL.revokeObjectURL(url);
      return true;
    }
    
    // 외부 URL인 경우 (삭제 불가)
    console.log('⚠️ 외부 URL은 삭제할 수 없음:', url);
    return true; // 성공으로 처리 (실제로는 삭제할 필요 없음)
    
  } catch (error) {
    console.error('❌ 파일 삭제 실패:', error);
    return false;
  }
};

export const generateUniqueId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

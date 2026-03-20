'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Camera, Loader2 } from 'lucide-react'
import Image from 'next/image'

const MAX_SIZE_MB = 5
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function AvatarUpload({
  userId,
  currentUrl,
  onUploaded,
}: {
  userId: string
  currentUrl: string | null
  onUploaded: (url: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentUrl)
  const supabase = createClient()

  const handleFile = async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Only JPEG, PNG or WebP allowed')
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Max ${MAX_SIZE_MB}MB`)
      return
    }

    setUploading(true)
    try {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `avatars/${userId}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(path, file, { upsert: true, contentType: file.type })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(path)

      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId)
      setPreview(publicUrl)
      onUploaded(publicUrl)
      toast.success('Photo updated')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="relative h-28 w-28 rounded-full overflow-hidden bg-muted group focus-visible:ring-2 focus-visible:ring-primary"
      aria-label="Change profile photo"
    >
      {preview ? (
        <Image src={preview} alt="Your avatar" fill className="object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center text-5xl">👤</div>
      )}

      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-white" />
        ) : (
          <Camera className="h-6 w-6 text-white" />
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        className="sr-only"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        aria-hidden
      />
    </button>
  )
}

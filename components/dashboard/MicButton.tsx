'use client'

import { useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { Mic, Square, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type RecordState = 'idle' | 'recording' | 'transcribing'

export type MicButtonHandle = { toggle: () => void }

interface MicButtonProps {
  onTranscribed: (text: string) => void
  disabled?: boolean
}

export const MicButton = forwardRef<MicButtonHandle, MicButtonProps>(function MicButton({ onTranscribed, disabled }, ref) {
  const [state, setState] = useState<RecordState>('idle')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        streamRef.current?.getTracks().forEach((t) => t.stop())
        streamRef.current = null

        const blob = new Blob(chunksRef.current, { type: recorder.mimeType })
        setState('transcribing')

        try {
          const form = new FormData()
          form.append('file', blob, 'audio.webm')
          form.append('polish', 'true')

          const res = await fetch('/api/transcribe', { method: 'POST', body: form })
          const data = await res.json()

          if (!res.ok) {
            toast.error(data.error ?? 'Transcription failed')
            return
          }

          onTranscribed(data.text)
        } catch {
          toast.error('Transcription failed')
        } finally {
          setState('idle')
        }
      }

      recorder.start()
      setState('recording')
    } catch (err) {
      if (err instanceof Error && err.name === 'NotAllowedError') {
        toast.error('Microphone permission denied')
      } else {
        toast.error('Could not access microphone')
      }
      setState('idle')
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
  }

  function handleClick() {
    if (state === 'idle') startRecording()
    else if (state === 'recording') stopRecording()
  }

  useImperativeHandle(ref, () => ({
    toggle: handleClick,
  }))

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || state === 'transcribing'}
      title={state === 'idle' ? 'Record voice message' : state === 'recording' ? 'Stop recording' : 'Transcribing…'}
      className={`p-1.5 rounded-md transition-colors ${
        state === 'recording'
          ? 'text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 animate-pulse'
          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {state === 'idle' && <Mic size={16} />}
      {state === 'recording' && <Square size={16} className="fill-red-500" />}
      {state === 'transcribing' && <Loader2 size={16} className="animate-spin" />}
    </button>
  )
})

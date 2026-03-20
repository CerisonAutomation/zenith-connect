'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { MoreVertical, ShieldAlert, Ban } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function BlockReportActions({ targetId, targetName }: { targetId: string; targetName: string }) {
  const router = useRouter()
  const [confirmBlock, setConfirmBlock] = useState(false)
  const [confirmReport, setConfirmReport] = useState(false)

  const handleBlock = async () => {
    const res = await fetch('/api/block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocked_id: targetId }),
    })
    if (res.ok) {
      toast.success(`${targetName} blocked`)
      router.push('/discover')
    } else {
      toast.error('Could not block user')
    }
  }

  const handleReport = async () => {
    const res = await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reported_id: targetId, reason: 'inappropriate_content' }),
    })
    if (res.ok) toast.success('Report submitted. Thank you.')
    else toast.error('Could not submit report')
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" aria-label="More actions">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setConfirmReport(true)} className="text-amber-500">
            <ShieldAlert className="h-4 w-4 mr-2" /> Report
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setConfirmBlock(true)} className="text-destructive">
            <Ban className="h-4 w-4 mr-2" /> Block
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmBlock} onOpenChange={setConfirmBlock}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block {targetName}?</AlertDialogTitle>
            <AlertDialogDescription>You won't see each other anymore.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBlock} className="bg-destructive">Block</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmReport} onOpenChange={setConfirmReport}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report {targetName}?</AlertDialogTitle>
            <AlertDialogDescription>This will be reviewed by our team.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReport}>Report</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

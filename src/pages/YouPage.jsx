import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Logout } from 'pixelarticons/react/Logout.js'
import { AvatarSquare } from 'pixelarticons/react/AvatarSquare.js'

export default function YouPage() {
  const { user, signOut } = useAuth()

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="gradient-border rounded-xl bg-retro-surface p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <AvatarSquare className="w-8 h-8 text-neon-cyan" />
          <div className="flex flex-col gap-1 min-w-0">
            <p className="text-retro-muted font-display text-[8px]">Signed in as</p>
            <p className="text-white text-sm truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      <Button variant="ghost" onClick={signOut}>
        <Logout className="w-4 h-4" /> Sign out
      </Button>
    </div>
  )
}

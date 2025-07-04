"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Lock } from "lucide-react"
import Dashboard from "@/components/dashboard"

interface User {
  email: string
  fullName: string
  password: string
  registeredAt: string
}

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const savedUserEmail = localStorage.getItem("currentUserEmail")
    if (savedUserEmail) {
      const userData = getUserData(savedUserEmail)
      if (userData) {
        setCurrentUser(userData)
      }
    }
  }, [])

  const getUserData = (email: string): User | null => {
    try {
      const userData = localStorage.getItem(`user_${email}`)
      return userData ? JSON.parse(userData) : null
    } catch {
      return null
    }
  }

  const saveUserData = (user: User) => {
    localStorage.setItem(`user_${user.email}`, JSON.stringify(user))
  }

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)

    if (!email || !password || !fullName) {
      setError("Fadlan buuxi dhammaan goobaha")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password-ku waa in uu ka badan yahay 6 xaraf")
      setLoading(false)
      return
    }

    const existingUser = getUserData(email)
    if (existingUser) {
      setError("User-kan horay ayuu u jiray. Fadlan gal")
      setLoading(false)
      return
    }

    const newUser: User = {
      email,
      fullName,
      password,
      registeredAt: new Date().toISOString(),
    }

    saveUserData(newUser)
    setMessage("✅ Akoon ayaa loo sameeyay! Hadda gal")
    setEmail("")
    setPassword("")
    setFullName("")
    setLoading(false)
  }

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!email || !password) {
      setError("Fadlan gali email iyo password")
      setLoading(false)
      return
    }

    const userData = getUserData(email)
    if (!userData) {
      setError("User-kan ma jiro. Fadlan diwan geli")
      setLoading(false)
      return
    }

    if (userData.password !== password) {
      setError("Password qalad ah")
      setLoading(false)
      return
    }

    setCurrentUser(userData)
    localStorage.setItem("currentUserEmail", email)
    setLoading(false)
  }

  const handleSignOut = () => {
    setCurrentUser(null)
    localStorage.removeItem("currentUserEmail")
    setEmail("")
    setPassword("")
  }

  if (currentUser) {
    return <Dashboard user={currentUser} onSignOut={handleSignOut} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
      

        <Card className="w-full shadow-xl">
          <Tabs defaultValue="signin" className="w-full">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">🔑 Gal</TabsTrigger>
                <TabsTrigger value="signup">📝 Diwan geli</TabsTrigger>
              </TabsList>
            </CardHeader>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4">
                  <CardTitle>Ku soo gal akoonkaaga</CardTitle>
                  <CardDescription>Gari email-kaaga iyo password-kaaga</CardDescription>

                  <div className="space-y-2">
                    <Label htmlFor="signin-email">📧 Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="example@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value.toLowerCase())}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">🔒 Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => {
                        setEmail("")
                        setPassword("")
                        setError("")
                        setMessage("")
                      }}
                    >
                      🗑️ Tirtir
                    </Button>

                    <Button type="submit" className="flex-1" disabled={loading}>
                      {loading ? "⏳ La galayo..." : "🚀 Gal"}
                    </Button>
                  </div>
                </CardContent>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4">
                  <CardTitle>Samee akoon cusub</CardTitle>
                  <CardDescription>Buuxi macluumaadka hoose si aad u sameyso akoon</CardDescription>

                  <div className="space-y-2">
                    <Label htmlFor="signup-name">👤 Magaca oo dhan</Label>
                    <div className="relative">
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Magacaaga oo dhan"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">📧 Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="example@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value.toLowerCase())}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">🔒 Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => {
                        setFullName("")
                        setEmail("")
                        setPassword("")
                        setError("")
                        setMessage("")
                      }}
                    >
                      🗑️ Tirtir
                    </Button>

                    <Button type="submit" className="flex-1" disabled={loading}>
                      {loading ? "⏳ La sameynayo..." : "✨ Diwan geli"}
                    </Button>
                  </div>
                </CardContent>
              </form>
            </TabsContent>
          </Tabs>

          {error && (
            <div className="px-6 pb-6">
              <Alert variant="destructive">
                <AlertDescription>❌ {error}</AlertDescription>
              </Alert>
            </div>
          )}

          {message && (
            <div className="px-6 pb-6">
              <Alert>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

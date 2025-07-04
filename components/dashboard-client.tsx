"use client"

import type React from "react"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, LogOut, DollarSign, Calendar, User, Moon, Sun, Filter } from "lucide-react"
import { useTheme } from "next-themes"

interface Loan {
  id: string
  title: string
  description: string
  amount: number
  due_date: string
  category: string
  borrower_name: string
  created_at: string
}

interface DashboardClientProps {
  initialLoans: Loan[]
  user: any
}

export default function DashboardClient({ initialLoans, user }: DashboardClientProps) {
  const [loans, setLoans] = useState<Loan[]>(initialLoans)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    due_date: "",
  
    category: "",
    borrower_name: "",
  })

  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const filteredLoans = loans.filter((loan) => {
    const matchesSearch =
      loan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.borrower_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.category.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch 
  })

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      amount: "",
      due_date: "",
      status: "pending",
      category: "",
      borrower_name: "",
    })
    setEditingLoan(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const loanData = {
      title: formData.title,
      description: formData.description,
      amount: Number.parseFloat(formData.amount),
      due_date: formData.due_date,
      status: formData.status,
      category: formData.category,
      borrower_name: formData.borrower_name,
      user_id: user.id,
    }

    if (editingLoan) {
      const { data, error } = await supabase.from("loans").update(loanData).eq("id", editingLoan.id).select().single()

      if (!error && data) {
        setLoans(loans.map((loan) => (loan.id === editingLoan.id ? data : loan)))
      }
    } else {
      const { data, error } = await supabase.from("loans").insert([loanData]).select().single()

      if (!error && data) {
        setLoans([data, ...loans])
      }
    }

    setIsAddDialogOpen(false)
    resetForm()
  }

  const handleEdit = (loan: Loan) => {
    setEditingLoan(loan)
    setFormData({
      title: loan.title,
      description: loan.description,
      amount: loan.amount.toString(),
      due_date: loan.due_date,
      status: loan.status,
      category: loan.category,
      borrower_name: loan.borrower_name,
    })
    setIsAddDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("loans").delete().eq("id", id)

    if (!error) {
      setLoans(loans.filter((loan) => loan.id !== id))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    }
  }

  const totalAmount = loans.reduce((sum, loan) => sum + loan.amount, 0)
  const paidAmount = loans.filter((loan) => loan.status === "paid").reduce((sum, loan) => sum + loan.amount, 0)
  const pendingAmount = totalAmount - paidAmount

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">💼 LoanBook</h1>
              <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">
                Ahlan {user.user_metadata?.full_name || user.email}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Ka bax
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wadarta Guud</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalAmount.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">La bixiyay</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${paidAmount.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">La sugayo</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">${pendingAmount.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Raadi deemo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Dhammaan</SelectItem>
              <SelectItem value="pending">La sugayo</SelectItem>
              <SelectItem value="paid">La bixiyay</SelectItem>
              <SelectItem value="overdue">Dhaafay</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Deemo cusub
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingLoan ? "Wax ka bedel deemada" : "Ku dar deemo cusub"}</DialogTitle>
                  <DialogDescription>Buuxi macluumaadka deemada</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Cinwaanka deemada</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="borrower_name">Magaca qofka deynta</Label>
                    <Input
                      id="borrower_name"
                      value={formData.borrower_name}
                      onChange={(e) => setFormData({ ...formData, borrower_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="amount">Lacagta ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="due_date">Taariikhda dhammaadka</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="category">Nooca</Label>
                    <Input
                      id="category"
                      placeholder="Tusaale: Ganacsi, Shakhsi, iwm"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="status">Xaalada</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">La sugayo</SelectItem>
                        <SelectItem value="paid">La bixiyay</SelectItem>
                        <SelectItem value="overdue">Dhaafay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Faahfaahin</Label>
                    <Textarea
                      id="description"
                      placeholder="Faahfaahin dheeraad ah..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="submit">{editingLoan ? "Cusboonaysii" : "Ku dar"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Loans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLoans.map((loan) => (
            <Card key={loan.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{loan.title}</CardTitle>
                  <Badge className={getStatusColor(loan.status)}>
                    {loan.status === "pending" ? "La sugayo" : loan.status === "paid" ? "La bixiyay" : "Dhaafay"}
                  </Badge>
                </div>
                <CardDescription className="flex items-center">
                  <User className="mr-1 h-4 w-4" />
                  {loan.borrower_name}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Lacagta:</span>
                    <span className="font-semibold text-lg">${loan.amount.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Taariikhda:</span>
                    <span className="text-sm flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {new Date(loan.due_date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Nooca:</span>
                    <Badge variant="outline">{loan.category}</Badge>
                  </div>

                  {loan.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{loan.description}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(loan)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(loan.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredLoans.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">💼</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Deemo ma jirto</h3>
            <p className="text-gray-500 dark:text-gray-400">Bilow deemo cusub si aad u bilowdo xareeynta</p>
          </div>
        )}
      </div>
    </div>
  )
}

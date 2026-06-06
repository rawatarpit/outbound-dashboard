import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { type BrandProfile } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Switch } from '@/components/ui/Switch'
import Drawer from '@/components/Drawer'
import BrandForm from '@/components/forms/BrandForm'
import { Plus, Building2, Mail, Search, ExternalLink, MoreHorizontal, Play, Pause, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { brandsAPI } from '@/lib/api'
import { AnimatedCounter } from '@/components/DashboardComponents'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'

export default function BrandsPage() {
  const { client } = useAuth()
  const [brands, setBrands] = useState<BrandProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<BrandProfile | null>(null)

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      const { data, error } = await brandsAPI.list(client?.id)
      if (error) throw error
      setBrands(data || [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch brands')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateBrand = () => {
    setEditingBrand(null)
    setIsModalOpen(true)
  }

  const handleEditBrand = (brand: BrandProfile) => {
    setEditingBrand(brand)
    setIsModalOpen(true)
  }

  const handleToggleDiscovery = async (brand: BrandProfile, enabled: boolean) => {
    try {
      const { error } = await brandsAPI.update(brand.id, { discovery_enabled: enabled })
      if (error) throw error
      toast.success(`Discovery ${enabled ? 'enabled' : 'disabled'} for ${brand.brand_name}`)
      fetchBrands()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update brand')
    }
  }

  const handleToggleOutbound = async (brand: BrandProfile, enabled: boolean) => {
    try {
      const { error } = await brandsAPI.update(brand.id, { outbound_enabled: enabled, send_enabled: enabled })
      if (error) throw error
      toast.success(`Outbound ${enabled ? 'enabled' : 'disabled'} for ${brand.brand_name}`)
      fetchBrands()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update brand')
    }
  }

  const handleTogglePause = async (brand: BrandProfile) => {
    try {
      const { error } = await brandsAPI.update(brand.id, { is_paused: !brand.is_paused })
      if (error) throw error
      toast.success(`${brand.is_paused ? 'Resumed' : 'Paused'} ${brand.brand_name}`)
      fetchBrands()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update brand')
    }
  }

  const handleDeleteBrand = async (brand: BrandProfile) => {
    if (!confirm(`Are you sure you want to delete ${brand.brand_name}?`)) return

    try {
      const { error } = await brandsAPI.delete(brand.id)
      if (error) throw error
      toast.success('Brand deleted successfully')
      fetchBrands()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete brand')
    }
  }

  const handleTriggerDiscovery = async (brand: BrandProfile) => {
    try {
      const { error } = await brandsAPI.triggerDiscovery(brand.id)
      if (error) throw error
      toast.success('Discovery triggered for ' + brand.brand_name)
    } catch (error: any) {
      toast.error(error.message || 'Failed to trigger discovery')
    }
  }

  const getStatusBadge = (brand: BrandProfile) => {
    if (!brand.is_active) return <Badge variant="secondary">Inactive</Badge>
    if (brand.is_paused) return <Badge variant="warning">Paused</Badge>
    if (brand.auto_paused) return <Badge variant="destructive">Auto-Paused</Badge>
    return <Badge variant="success">Active</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-border border-t-primary shadow-2xl" />
          <div className="absolute inset-0 animate-pulse rounded-full h-10 w-10 bg-primary/5 blur-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Brands</span>
          </h1>
          <p className="text-muted-foreground mt-1">Manage your brand profiles and campaigns</p>
        </div>
        <Button onClick={handleCreateBrand}>
          <Plus className="h-4 w-4 mr-2" />
          Add Brand
        </Button>
      </div>

      {brands.length === 0 ? (
        <Card className="overflow-hidden rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-muted border border-border flex items-center justify-center mb-6 shadow-inner">
              <Building2 className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">No brands yet</h3>
            <p className="text-sm text-muted-foreground mb-8">Get started by creating your first brand profile</p>
            <Button onClick={handleCreateBrand}>
              <Plus className="h-4 w-4 mr-2" />
              Add Brand
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => (
            <div key={brand.id} className="group relative">
              <div className="relative overflow-hidden rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-sm hover:shadow-md hover:border-border transition-all duration-300">
                <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#6366f112' }}>
                        <Building2 className="h-5 w-5" style={{ color: '#6366f1' }} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground truncate">{brand.brand_name}</p>
                        <p className="text-sm text-muted-foreground truncate">{brand.product}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-1.5 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-accent transition-all duration-200">
                        <MoreHorizontal className="h-5 w-5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditBrand(brand)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTriggerDiscovery(brand)}>
                          <Search className="h-4 w-4 mr-2" />
                          Trigger Discovery
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTogglePause(brand)}>
                          {brand.is_paused ? (
                            <><Play className="h-4 w-4 mr-2" />Resume</>
                          ) : (
                            <><Pause className="h-4 w-4 mr-2" />Pause</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteBrand(brand)} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap mb-4">
                    {getStatusBadge(brand)}
                    {brand.discovery_enabled && (
                      <span className="text-xs font-medium text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-full">Discovery</span>
                    )}
                    {brand.outbound_enabled && (
                      <span className="text-xs font-medium text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-full">Outbound</span>
                    )}
                  </div>

                  <div className="bg-muted/30 rounded-xl p-3.5 space-y-3 border border-border mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Search className="h-3.5 w-3.5 text-muted-foreground/50" />
                        <span className="text-xs text-muted-foreground/80">Discovery</span>
                      </div>
                      <Switch
                        checked={brand.discovery_enabled ?? false}
                        onCheckedChange={(checked) => handleToggleDiscovery(brand, checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground/50" />
                        <span className="text-xs text-muted-foreground/80">Outbound</span>
                      </div>
                      <Switch
                        checked={brand.outbound_enabled ?? false}
                        onCheckedChange={(checked) => handleToggleOutbound(brand, checked)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm mb-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground/60">Sent Today</p>
                        <p className="font-bold text-foreground"><AnimatedCounter value={brand.sent_count || 0} /></p>
                      </div>
                      <div className="w-px h-8 bg-border" />
                      <div>
                        <p className="text-xs text-muted-foreground/60">Daily Limit</p>
                        <p className="font-bold text-foreground">{brand.daily_send_limit || 'Unlimited'}</p>
                      </div>
                    </div>
                  </div>

                  <Link to={`/brands/${brand.id}`}>
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Drawer
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBrand ? 'Edit Brand' : 'Create Brand'}
        description="Configure your brand profile settings"
        size="lg"
      >
        <BrandForm
          brand={editingBrand}
          onSuccess={() => {
            setIsModalOpen(false)
            fetchBrands()
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Drawer>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase, type BrandProfile } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Switch } from '@/components/ui/Switch'
import Modal from '@/components/Modal'
import BrandForm from '@/components/forms/BrandForm'
import { Plus, Building2, Mail, Search, ExternalLink, MoreHorizontal, Play, Pause } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'

export default function BrandsPage() {
  const [brands, setBrands] = useState<BrandProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<BrandProfile | null>(null)

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brand_profiles')
        .select('*')
        .order('created_at', { ascending: false })

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
      const { error } = await supabase
        .from('brand_profiles')
        .update({ discovery_enabled: enabled })
        .eq('id', brand.id)

      if (error) throw error
      toast.success(`Discovery ${enabled ? 'enabled' : 'disabled'} for ${brand.brand_name}`)
      fetchBrands()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update brand')
    }
  }

  const handleToggleOutbound = async (brand: BrandProfile, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('brand_profiles')
        .update({ outbound_enabled: enabled, send_enabled: enabled })
        .eq('id', brand.id)

      if (error) throw error
      toast.success(`Outbound ${enabled ? 'enabled' : 'disabled'} for ${brand.brand_name}`)
      fetchBrands()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update brand')
    }
  }

  const handleTogglePause = async (brand: BrandProfile) => {
    try {
      const { error } = await supabase
        .from('brand_profiles')
        .update({ is_paused: !brand.is_paused })
        .eq('id', brand.id)

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
      const { error } = await supabase
        .from('brand_profiles')
        .delete()
        .eq('id', brand.id)

      if (error) throw error
      toast.success('Brand deleted successfully')
      fetchBrands()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete brand')
    }
  }

  const handleTriggerDiscovery = async (brand: BrandProfile) => {
    try {
      const { error } = await supabase
        .from('brand_profiles')
        .update({ manual_discovery_requested: true })
        .eq('id', brand.id)

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
          <p className="text-gray-500">Manage your brand profiles and campaigns</p>
        </div>
        <Button onClick={handleCreateBrand}>
          <Plus className="h-4 w-4 mr-2" />
          Add Brand
        </Button>
      </div>

      {brands.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No brands yet</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first brand profile</p>
            <Button onClick={handleCreateBrand}>
              <Plus className="h-4 w-4 mr-2" />
              Add Brand
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => (
            <Card key={brand.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{brand.brand_name}</CardTitle>
                      <p className="text-sm text-gray-500">{brand.product}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-1 rounded hover:bg-gray-100">
                      <MoreHorizontal className="h-5 w-5 text-gray-500" />
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
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Resume
                          </>
                        ) : (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteBrand(brand)}
                        className="text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  {getStatusBadge(brand)}
                  {brand.discovery_enabled && (
                    <Badge variant="secondary">Discovery</Badge>
                  )}
                  {brand.outbound_enabled && (
                    <Badge variant="secondary">Outbound</Badge>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Search className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Discovery</span>
                    </div>
                    <Switch
                      checked={brand.discovery_enabled}
                      onCheckedChange={(checked) => handleToggleDiscovery(brand, checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Outbound</span>
                    </div>
                    <Switch
                      checked={brand.outbound_enabled}
                      onCheckedChange={(checked) => handleToggleOutbound(brand, checked)}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Sent Today</span>
                    <span className="font-medium">{brand.sent_count || 0}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Daily Limit</span>
                    <span className="font-medium">{brand.daily_send_limit || 'Unlimited'}</span>
                  </div>
                </div>

                <Link to={`/brands/${brand.id}`}>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
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
      </Modal>
    </div>
  )
}

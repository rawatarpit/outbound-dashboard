import { useState } from 'react'
import { supabase, type BrandProfile } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import toast from 'react-hot-toast'

interface CompanyFormProps {
  brands: BrandProfile[]
  company?: any
  onSuccess: () => void
  onCancel: () => void
}

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
]

export default function CompanyForm({ brands, company, onSuccess, onCancel }: CompanyFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    brand_id: company?.brand_id || brands[0]?.id || '',
    name: company?.name || '',
    domain: company?.domain || '',
    website: company?.website || '',
    industry: company?.industry || '',
    employee_count: company?.employee_count?.toString() || '',
    linkedin_url: company?.linkedin_url || '',
    source: company?.source || 'manual',
    priority: company?.priority || 'medium',
    notes: company?.notes || ''
  })

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = {
        brand_id: formData.brand_id,
        name: formData.name,
        domain: formData.domain || null,
        website: formData.website || null,
        industry: formData.industry || null,
        employee_count: formData.employee_count ? parseInt(formData.employee_count) : null,
        linkedin_url: formData.linkedin_url || null,
        source: formData.source,
        priority: formData.priority,
        notes: formData.notes || null,
        status: 'researching'
      }

      if (company?.id) {
        const { error } = await supabase
          .from('companies')
          .update(payload)
          .eq('id', company.id)

        if (error) throw error
        toast.success('Company updated')
      } else {
        const { error } = await supabase
          .from('companies')
          .insert([payload])

        if (error) throw error
        toast.success('Company created')
      }

      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save company')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="brand" required>Brand</Label>
          <Select value={formData.brand_id} onValueChange={(v) => handleChange('brand_id', v)} required>
            <SelectTrigger>
              <SelectValue placeholder="Select a brand" />
            </SelectTrigger>
            <SelectContent>
              {brands.map(brand => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.brand_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name" required>Company Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Acme Inc"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              value={formData.domain}
              onChange={(e) => handleChange('domain', e.target.value)}
              placeholder="acme.com"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://acme.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              value={formData.industry}
              onChange={(e) => handleChange('industry', e.target.value)}
              placeholder="Technology"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="employee_count">Employee Count</Label>
            <Input
              id="employee_count"
              type="number"
              value={formData.employee_count}
              onChange={(e) => handleChange('employee_count', e.target.value)}
              placeholder="50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={formData.priority} onValueChange={(v) => handleChange('priority', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedin_url">LinkedIn URL</Label>
          <Input
            id="linkedin_url"
            value={formData.linkedin_url}
            onChange={(e) => handleChange('linkedin_url', e.target.value)}
            placeholder="https://linkedin.com/company/acme"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Additional notes..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {company ? 'Update Company' : 'Create Company'}
        </Button>
      </div>
    </form>
  )
}

import { useState, useRef } from 'react'
import { supabase, type BrandProfile } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Upload, X, AlertCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface LeadImportFormProps {
  brands: BrandProfile[]
  onSuccess: () => void
  onCancel: () => void
}

interface ParsedLead {
  first_name?: string
  last_name?: string
  email: string
  title?: string
  company?: string
  domain?: string
  linkedin_url?: string
  source?: string
}

export default function LeadImportForm({ brands, onSuccess, onCancel }: LeadImportFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [parsedLeads, setParsedLeads] = useState<ParsedLead[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [selectedBrandId, setSelectedBrandId] = useState(brands[0]?.id || '')
  fileRef: useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    parseCSV(selectedFile)
  }

  const parseCSV = async (file: File) => {
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      setErrors(['CSV file must have a header row and at least one data row'])
      return
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const leads: ParsedLead[] = []
    const parseErrors: string[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])
      const lead: ParsedLead = {}

      headers.forEach((header, index) => {
        const value = values[index]?.trim()
        if (!value) return

        switch (header) {
          case 'email':
          case 'e-mail':
            lead.email = value
            break
          case 'first_name':
          case 'firstname':
          case 'first name':
            lead.first_name = value
            break
          case 'last_name':
          case 'lastname':
          case 'last name':
            lead.last_name = value
            break
          case 'name':
          case 'full_name':
          case 'fullname':
          case 'full name':
            const nameParts = value.split(' ')
            if (!lead.first_name && nameParts[0]) lead.first_name = nameParts[0]
            if (!lead.last_name && nameParts.slice(1).length > 0) {
              lead.last_name = nameParts.slice(1).join(' ')
            }
            break
          case 'title':
          case 'job_title':
          case 'jobtitle':
            lead.title = value
            break
          case 'company':
          case 'company_name':
          case 'companyname':
            lead.company = value
            break
          case 'domain':
          case 'website':
            lead.domain = value.replace(/^https?:\/\//, '').split('/')[0]
            break
          case 'linkedin':
          case 'linkedin_url':
          case 'linkedinurl':
            lead.linkedin_url = value
            break
          case 'source':
            lead.source = value
            break
        }
      })

      if (!lead.email) {
        parseErrors.push(`Row ${i + 1}: Missing email address`)
        continue
      }

      if (!isValidEmail(lead.email)) {
        parseErrors.push(`Row ${i + 1}: Invalid email format - ${lead.email}`)
        continue
      }

      leads.push(lead)
    }

    setParsedLeads(leads)
    setErrors(parseErrors)
  }

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let char of line) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }
    result.push(current)

    return result
  }

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleImport = async () => {
    if (!selectedBrandId) {
      toast.error('Please select a brand')
      return
    }

    if (parsedLeads.length === 0) {
      toast.error('No valid leads to import')
      return
    }

    setIsLoading(true)
    try {
      const leadsToInsert = parsedLeads.map(lead => ({
        brand_id: selectedBrandId,
        email: lead.email,
        first_name: lead.first_name || null,
        last_name: lead.last_name || null,
        full_name: [lead.first_name, lead.last_name].filter(Boolean).join(' ') || null,
        title: lead.title || null,
        domain: lead.domain || null,
        linkedin_url: lead.linkedin_url || null,
        source: lead.source || 'import',
        status: 'new'
      }))

      const { data, error } = await supabase
        .from('leads')
        .insert(leadsToInsert)
        .select('id')

      if (error) throw error

      await supabase.from('lead_import_batches').insert([{
        source: 'csv',
        product: brands.find(b => b.id === selectedBrandId)?.product || 'Unknown',
        imported_count: data?.length || 0
      }])

      toast.success(`Successfully imported ${data?.length || 0} leads`)
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Failed to import leads')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="brand" required>Select Brand</Label>
        <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a brand" />
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

      <div className="space-y-2">
        <Label>Upload CSV File</Label>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            {file ? file.name : 'Click to upload or drag and drop'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            CSV files with columns: email, first_name, last_name, title, company, domain
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Parsing Errors</p>
              <ul className="mt-1 text-sm text-red-600 list-disc list-inside">
                {errors.slice(0, 10).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
                {errors.length > 10 && (
                  <li>...and {errors.length - 10} more errors</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {parsedLeads.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <p className="font-medium text-green-800">
              {parsedLeads.length} leads ready to import
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleImport}
          isLoading={isLoading}
          disabled={parsedLeads.length === 0 || !selectedBrandId}
        >
          Import {parsedLeads.length} Leads
        </Button>
      </div>
    </div>
  )
}

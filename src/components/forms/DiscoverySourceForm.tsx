import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Switch } from '@/components/ui/Switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { DISCOVERY_SOURCE_TYPES } from '@/lib/supabase'
import { discoverySourcesAPI } from '@/lib/api'
import toast from 'react-hot-toast'

interface DiscoverySourceFormProps {
  brandId: string
  source?: any
  onSuccess: () => void
  onCancel: () => void
}

const TYPE_ICONS: Record<string, string> = {
  apollo: '🔵',
  apify: '🟢',
  hunter: '🟠',
  github: '⚫',
  csv: '📄',
  url_scraper: '🔗',
}

export default function DiscoverySourceForm({ brandId, source, onSuccess, onCancel }: DiscoverySourceFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const config = source?.config || {}

  const [formData, setFormData] = useState({
    name: source?.name || '',
    type: source?.type || 'apollo',
    is_active: source?.is_active ?? true,
    rate_limit_per_min: source?.rate_limit_per_min || 10,
    schedule_cron: source?.schedule_cron || '',
    execution_mode: source?.execution_mode || 'pull',
  })

  const [apolloApiKey, setApolloApiKey] = useState(config.api_key || '')
  const [apolloSearchQuery, setApolloSearchQuery] = useState(config.search_query || '')
  const [apolloIndustry, setApolloIndustry] = useState(config.industry || '')
  const [apolloEmployeeMin, setApolloEmployeeMin] = useState(config.employee_min || '')
  const [apolloEmployeeMax, setApolloEmployeeMax] = useState(config.employee_max || '')

  const [hunterApiKey, setHunterApiKey] = useState(config.api_key || '')
  const [hunterDomain, setHunterDomain] = useState(config.domain || '')

  const [apifyApiKey, setApifyApiKey] = useState(config.api_key || '')
  const [apifyActorId, setApifyActorId] = useState(config.actor_id || '')
  const [apifyRunInput, setApifyRunInput] = useState(JSON.stringify(config.run_input || {}, null, 2))

  const [githubToken, setGithubToken] = useState(config.token || '')
  const [githubSearchQuery, setGithubSearchQuery] = useState(config.search_query || '')
  const [githubRepo, setGithubRepo] = useState(config.repo || '')

  const [urlPattern, setUrlPattern] = useState(config.url_pattern || '')
  const [urlMaxDepth, setUrlMaxDepth] = useState(config.max_depth || '1')

  useEffect(() => {
    setApolloApiKey(config.api_key || '')
    setApolloSearchQuery(config.search_query || '')
    setApolloIndustry(config.industry || '')
    setApolloEmployeeMin(config.employee_min || '')
    setApolloEmployeeMax(config.employee_max || '')
    setHunterApiKey(config.api_key || '')
    setHunterDomain(config.domain || '')
    setApifyApiKey(config.api_key || '')
    setApifyActorId(config.actor_id || '')
    setApifyRunInput(JSON.stringify(config.run_input || {}, null, 2))
    setGithubToken(config.token || '')
    setGithubSearchQuery(config.search_query || '')
    setGithubRepo(config.repo || '')
    setUrlPattern(config.url_pattern || '')
    setUrlMaxDepth(config.max_depth || '1')
  }, [source?.id])

  const buildConfig = () => {
    switch (formData.type) {
      case 'apollo':
        return {
          api_key: apolloApiKey,
          search_query: apolloSearchQuery,
          industry: apolloIndustry,
          employee_min: apolloEmployeeMin ? parseInt(apolloEmployeeMin) : undefined,
          employee_max: apolloEmployeeMax ? parseInt(apolloEmployeeMax) : undefined,
        }
      case 'hunter':
        return { api_key: hunterApiKey, domain: hunterDomain }
      case 'apify':
        let parsedInput = {}
        try { parsedInput = JSON.parse(apifyRunInput) } catch {}
        return { api_key: apifyApiKey, actor_id: apifyActorId, run_input: parsedInput }
      case 'github':
        return { token: githubToken, search_query: githubSearchQuery, repo: githubRepo }
      case 'url_scraper':
        return { url_pattern: urlPattern, max_depth: parseInt(urlMaxDepth) || 1 }
      default:
        return {}
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = {
        brand_id: brandId,
        name: formData.name,
        type: formData.type,
        config: buildConfig(),
        is_active: formData.is_active,
        rate_limit_per_min: formData.rate_limit_per_min,
        schedule_cron: formData.schedule_cron || null,
        execution_mode: formData.execution_mode,
      }

      if (source?.id) {
        const { error } = await discoverySourcesAPI.update(source.id, payload)
        if (error) throw error
        toast.success('Source updated successfully')
      } else {
        const { error } = await discoverySourcesAPI.create(payload)
        if (error) throw error
        toast.success('Source created successfully')
      }

      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save source')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedLabel = DISCOVERY_SOURCE_TYPES.find(t => t.id === formData.type)?.label || formData.type

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" required>Source Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Apollo Tech Companies"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type" required>Source Type</Label>
          <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DISCOVERY_SOURCE_TYPES.filter(t => t.id !== 'csv').map(opt => (
                <SelectItem key={opt.id} value={opt.id}>
                  {TYPE_ICONS[opt.id]} {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            {formData.type === 'apollo' && 'Search and import leads from Apollo.io database'}
            {formData.type === 'hunter' && 'Find email addresses for a specific domain via Hunter.io'}
            {formData.type === 'apify' && 'Extract data using Apify web scraping actors'}
            {formData.type === 'github' && 'Discover developers and repos from GitHub'}
            {formData.type === 'url_scraper' && 'Scrape websites to discover companies and contacts'}
          </p>
        </div>

        {formData.type === 'apollo' && (
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-4">
            <h4 className="text-sm font-semibold text-blue-800">Apollo.io Configuration</h4>
            <div className="space-y-2">
              <Label htmlFor="apollo_api_key">API Key</Label>
              <Input
                id="apollo_api_key"
                type="password"
                value={apolloApiKey}
                onChange={(e) => setApolloApiKey(e.target.value)}
                placeholder="sk-xxxxxxxxxxxx"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apollo_search">Search Query</Label>
              <Input
                id="apollo_search"
                value={apolloSearchQuery}
                onChange={(e) => setApolloSearchQuery(e.target.value)}
                placeholder="e.g. CTO artificial intelligence"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="apollo_industry">Industry</Label>
                <Input
                  id="apollo_industry"
                  value={apolloIndustry}
                  onChange={(e) => setApolloIndustry(e.target.value)}
                  placeholder="e.g. SaaS"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apollo_emp_min">Min Employees</Label>
                <Input
                  id="apollo_emp_min"
                  type="number"
                  value={apolloEmployeeMin}
                  onChange={(e) => setApolloEmployeeMin(e.target.value)}
                  placeholder="10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apollo_emp_max">Max Employees</Label>
                <Input
                  id="apollo_emp_max"
                  type="number"
                  value={apolloEmployeeMax}
                  onChange={(e) => setApolloEmployeeMax(e.target.value)}
                  placeholder="1000"
                />
              </div>
            </div>
          </div>
        )}

        {formData.type === 'hunter' && (
          <div className="rounded-xl border border-border bg-muted p-4 space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Hunter.io Configuration</h4>
            <div className="space-y-2">
              <Label htmlFor="hunter_api_key">API Key</Label>
              <Input
                id="hunter_api_key"
                type="password"
                value={hunterApiKey}
                onChange={(e) => setHunterApiKey(e.target.value)}
                placeholder="xxxxxxxxxxxxxxxx"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hunter_domain">Target Domain</Label>
              <Input
                id="hunter_domain"
                value={hunterDomain}
                onChange={(e) => setHunterDomain(e.target.value)}
                placeholder="e.g. example.com"
              />
            </div>
          </div>
        )}

        {formData.type === 'apify' && (
          <div className="rounded-xl border border-green-100 bg-green-50/50 p-4 space-y-4">
            <h4 className="text-sm font-semibold text-green-800">Apify Configuration</h4>
            <div className="space-y-2">
              <Label htmlFor="apify_api_key">API Key</Label>
              <Input
                id="apify_api_key"
                type="password"
                value={apifyApiKey}
                onChange={(e) => setApifyApiKey(e.target.value)}
                placeholder="apify_api_xxxxxxxx"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apify_actor">Actor ID</Label>
              <Input
                id="apify_actor"
                value={apifyActorId}
                onChange={(e) => setApifyActorId(e.target.value)}
                placeholder="e.g. nFJndZzFJndZz"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apify_input">Run Input (JSON)</Label>
              <Textarea
                id="apify_input"
                value={apifyRunInput}
                onChange={(e) => setApifyRunInput(e.target.value)}
                rows={5}
                className="font-mono text-sm"
                placeholder='{"search": "example"}'
              />
            </div>
          </div>
        )}

        {formData.type === 'github' && (
          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-4">
            <h4 className="text-sm font-semibold text-gray-800">GitHub Configuration</h4>
            <div className="space-y-2">
              <Label htmlFor="github_token">Personal Access Token</Label>
              <Input
                id="github_token"
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxx"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github_search">Search Query</Label>
              <Input
                id="github_search"
                value={githubSearchQuery}
                onChange={(e) => setGithubSearchQuery(e.target.value)}
                placeholder="e.g. location:san-francisco followers:>100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github_repo">Repository (optional)</Label>
              <Input
                id="github_repo"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                placeholder="owner/repo"
              />
            </div>
          </div>
        )}

        {formData.type === 'url_scraper' && (
          <div className="rounded-xl border border-border bg-muted p-4 space-y-4">
            <h4 className="text-sm font-semibold text-foreground">URL Scraper Configuration</h4>
            <div className="space-y-2">
              <Label htmlFor="url_pattern">URL Pattern</Label>
              <Input
                id="url_pattern"
                value={urlPattern}
                onChange={(e) => setUrlPattern(e.target.value)}
                placeholder="https://example.com/companies/*"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url_depth">Max Scrape Depth</Label>
              <Input
                id="url_depth"
                type="number"
                value={urlMaxDepth}
                onChange={(e) => setUrlMaxDepth(e.target.value)}
                min={1}
                max={5}
              />
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="rate_limit_per_min">Rate Limit (per minute)</Label>
            <Input
              id="rate_limit_per_min"
              type="number"
              value={formData.rate_limit_per_min}
              onChange={(e) => setFormData({ ...formData, rate_limit_per_min: parseInt(e.target.value) })}
              min={1}
              max={60}
            />
            <p className="text-xs text-gray-500">Max API requests per minute</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="schedule_cron">Schedule (Cron)</Label>
            <Input
              id="schedule_cron"
              value={formData.schedule_cron}
              onChange={(e) => setFormData({ ...formData, schedule_cron: e.target.value })}
              placeholder="0 */6 * * *"
            />
            <p className="text-xs text-gray-500">Leave empty for manual only</p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border p-4">
          <div>
            <Label className="text-base">Active</Label>
            <p className="text-sm text-gray-500">Enable this source for scheduled discovery</p>
          </div>
          <Switch
            checked={formData.is_active}
            onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {source ? 'Update' : 'Create'} {selectedLabel} Source
        </Button>
      </div>
    </form>
  )
}

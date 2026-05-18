import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { settingsAPI } from '@/lib/api'
import { LLM_PROVIDERS } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface LLMConfigFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function LLMConfigForm({ onSuccess, onCancel }: LLMConfigFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [formData, setFormData] = useState({
    llm_provider: 'ollama',
    llm_model: '',
    llm_temperature: '0.7',
    llm_base_url: '',
    llm_api_key: '',
  })

  useEffect(() => {
    fetchLLMConfig()
  }, [])

  useEffect(() => {
    if (formData.llm_provider) {
      fetchModels(formData.llm_provider)
    }
  }, [formData.llm_provider])

  const fetchLLMConfig = async () => {
    setIsFetching(true)
    try {
      const { data, error } = await settingsAPI.getLLM()
      if (error) throw error
      if (data) {
        setFormData({
          llm_provider: data.llm_provider || 'ollama',
          llm_model: data.llm_model || '',
          llm_temperature: data.llm_temperature?.toString() || '0.7',
          llm_base_url: data.llm_base_url || '',
          llm_api_key: data.llm_api_key || '',
        })
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch LLM config')
    } finally {
      setIsFetching(false)
    }
  }

  const fetchModels = async (provider: string) => {
    try {
      const { data, error } = await settingsAPI.getLLMModels(provider)
      if (!error && data?.models) {
        setAvailableModels(data.models)
      } else {
        setAvailableModels([])
      }
    } catch {
      setAvailableModels([])
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = {
        llm_provider: formData.llm_provider,
        llm_model: formData.llm_model || null,
        llm_temperature: parseFloat(formData.llm_temperature) || 0.7,
        llm_base_url: formData.llm_base_url || null,
        llm_api_key: formData.llm_api_key || null,
      }

      const { error } = await settingsAPI.updateLLM(payload)
      if (error) throw error

      toast.success('LLM configuration saved')
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save LLM configuration')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProviderChange = (value: string) => {
    handleChange('llm_provider', value)
    handleChange('llm_model', '')
    
    const provider = LLM_PROVIDERS.find(p => p.id === value)
    if (provider?.id === 'ollama') {
      handleChange('llm_base_url', 'http://localhost:11434')
    } else if (provider?.id === 'cloudflare') {
      handleChange('llm_base_url', 'https://api.cloudflare.com/client/v4/accounts/{account_id}/ai')
    } else {
      handleChange('llm_base_url', '')
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-foreground" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-border p-4 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">LLM Provider Settings</h3>

        <div>
          <Label>Provider</Label>
          <Select value={formData.llm_provider} onValueChange={handleProviderChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LLM_PROVIDERS.map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  {provider.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Model</Label>
          {availableModels.length > 0 ? (
            <Select value={formData.llm_model} onValueChange={(value) => handleChange('llm_model', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={formData.llm_model}
              onChange={(e) => handleChange('llm_model', e.target.value)}
              placeholder="e.g., gpt-4, claude-3-sonnet, llama3"
            />
          )}
        </div>

        <div>
          <Label>Temperature</Label>
          <Input
            type="number"
            step="0.1"
            min="0"
            max="2"
            value={formData.llm_temperature}
            onChange={(e) => handleChange('llm_temperature', e.target.value)}
            placeholder="0.7"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Lower values are more deterministic, higher values are more creative
          </p>
        </div>

        <div>
          <Label>Base URL (Optional)</Label>
          <Input
            value={formData.llm_base_url}
            onChange={(e) => handleChange('llm_base_url', e.target.value)}
            placeholder="Auto-filled for some providers"
          />
        </div>

        <div>
          <Label>API Key</Label>
          <Input
            type="password"
            value={formData.llm_api_key}
            onChange={(e) => handleChange('llm_api_key', e.target.value)}
            placeholder="sk-..."
          />
          <p className="text-xs text-muted-foreground mt-1">
            Not required for Ollama (local)
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading} className="flex-1">
          Save Configuration
        </Button>
      </div>
    </form>
  )
}

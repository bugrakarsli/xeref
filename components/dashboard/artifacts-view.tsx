'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import type { Artifact, ArtifactFilterType, ArtifactType } from '@/lib/types'
import { createArtifact, deleteArtifact, duplicateArtifact } from '@/app/actions/artifacts'
import { ArtifactList } from './artifacts/artifact-list'
import { ArtifactDetail } from './artifacts/artifact-detail'

interface ArtifactsViewProps {
  initialArtifacts: Artifact[]
  initialSelectedId?: string
  previewArtifact?: Artifact | null
}

export function ArtifactsView({ initialArtifacts, initialSelectedId, previewArtifact }: ArtifactsViewProps) {
  const [artifacts, setArtifacts] = useState<Artifact[]>(initialArtifacts)
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(() => {
    if (!initialSelectedId) return null
    const owned = initialArtifacts.some((a) => a.id === initialSelectedId)
    return owned || previewArtifact?.id === initialSelectedId ? initialSelectedId : null
  })
  const [selectedVersionIndex, setSelectedVersionIndex] = useState<number>(() => {
    if (!initialSelectedId) return 0
    const art = initialArtifacts.find((a) => a.id === initialSelectedId) ?? previewArtifact
    return art?.currentVersion ?? 0
  })
  const [filterType, setFilterType] = useState<ArtifactFilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showingDetail, setShowingDetail] = useState(!!initialSelectedId)
  const [creating, setCreating] = useState(false)

  const filteredArtifacts = useMemo(() => {
    return artifacts
      .filter((a) => filterType === 'all' || a.type === filterType)
      .filter((a) => {
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        return (
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.tags.some((t) => t.includes(q))
        )
      })
  }, [artifacts, filterType, searchQuery])

  // The artifact shown in the detail pane — could be owned or a preview
  const allAccessible = previewArtifact
    ? [...artifacts, previewArtifact]
    : artifacts
  const selectedArtifact = allAccessible.find((a) => a.id === selectedArtifactId) ?? null
  const isPreview = selectedArtifact?.id === previewArtifact?.id && !!previewArtifact

  function updateUrl(artifactId: string | null, filter: ArtifactFilterType) {
    const params = new URLSearchParams(window.location.search)
    if (artifactId) params.set('id', artifactId)
    else params.delete('id')
    if (filter && filter !== 'all') params.set('filter', filter)
    else params.delete('filter')
    const qs = params.toString()
    window.history.replaceState({}, '', qs ? `?${qs}` : window.location.pathname)
  }

  function handleSelectArtifact(artifact: Artifact) {
    setSelectedArtifactId(artifact.id)
    setSelectedVersionIndex(artifact.currentVersion)
    setShowingDetail(true)
    updateUrl(artifact.id, filterType)
  }

  function handleVersionChange(index: number) {
    if (!selectedArtifact) return
    setSelectedVersionIndex(index)
    const v = selectedArtifact.versions[index]
    toast.success(`Viewing v${v.version}: "${v.label ?? `Version ${v.version}`}"`)
  }

  function handleFilterChange(type: ArtifactFilterType) {
    setFilterType(type)
    updateUrl(selectedArtifactId, type)
  }

  function handleBack() {
    setShowingDetail(false)
    setSelectedArtifactId(null)
    updateUrl(null, filterType)
  }

  async function handleCreate(type?: ArtifactType) {
    setCreating(true)
    try {
      const artifact = await createArtifact({ type })
      setArtifacts((prev) => [artifact, ...prev])
      setSelectedArtifactId(artifact.id)
      setSelectedVersionIndex(0)
      setShowingDetail(true)
      updateUrl(artifact.id, filterType)
    } catch {
      toast.error('Failed to create artifact')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete() {
    if (!selectedArtifactId) return
    try {
      await deleteArtifact(selectedArtifactId)
      setArtifacts((prev) => prev.filter((a) => a.id !== selectedArtifactId))
      handleBack()
      toast.success('Artifact deleted')
    } catch {
      toast.error('Failed to delete artifact')
    }
  }

  async function handleSaveCopy() {
    if (!previewArtifact) return
    try {
      const copy = await duplicateArtifact(previewArtifact.id)
      setArtifacts((prev) => [copy, ...prev])
      setSelectedArtifactId(copy.id)
      setSelectedVersionIndex(copy.currentVersion)
      toast.success(`"${copy.title}" saved to your library`)
    } catch {
      toast.error('Failed to save copy')
    }
  }

  return (
    <section
      aria-label="Artifacts"
      className="flex flex-col md:flex-row h-full min-h-0 overflow-hidden flex-1"
    >
      <ArtifactList
        artifacts={filteredArtifacts}
        selectedId={selectedArtifactId}
        filterType={filterType}
        searchQuery={searchQuery}
        loading={false}
        creating={creating}
        onSearchChange={setSearchQuery}
        onFilterChange={handleFilterChange}
        onSelect={handleSelectArtifact}
        onCreate={handleCreate}
        hidden={showingDetail}
      />
      <ArtifactDetail
        artifact={selectedArtifact}
        selectedVersionIndex={selectedVersionIndex}
        onVersionChange={handleVersionChange}
        onBack={handleBack}
        onDelete={handleDelete}
        onSaveCopy={handleSaveCopy}
        readOnly={isPreview}
        visible={showingDetail}
      />
    </section>
  )
}

'use client'

import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import type { Artifact, ArtifactFilterType } from '@/lib/types'
import { MOCK_ARTIFACTS } from './artifacts/mock-artifacts'
import { ArtifactList } from './artifacts/artifact-list'
import { ArtifactDetail } from './artifacts/artifact-detail'

export function ArtifactsView() {
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null)
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0)
  const [filterType, setFilterType] = useState<ArtifactFilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showingDetail, setShowingDetail] = useState(false)
  const [loading, setLoading] = useState(true)

  // Simulate async fetch and restore URL state on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const artifactId = params.get('artifact')
    const version = params.get('version')
    const filter = params.get('filter') as ArtifactFilterType | null

    if (filter && filter !== 'all') setFilterType(filter)

    const timer = setTimeout(() => {
      setLoading(false)
      if (artifactId) {
        const art = MOCK_ARTIFACTS.find((a) => a.id === artifactId)
        if (art) {
          setSelectedArtifactId(art.id)
          setShowingDetail(true)
          if (version) {
            const vIdx = art.versions.findIndex((v) => String(v.version) === version)
            setSelectedVersionIndex(vIdx >= 0 ? vIdx : art.currentVersion)
          } else {
            setSelectedVersionIndex(art.currentVersion)
          }
        }
      }
    }, 600)

    return () => clearTimeout(timer)
  }, [])

  const filteredArtifacts = useMemo(() => {
    return MOCK_ARTIFACTS
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
  }, [filterType, searchQuery])

  const selectedArtifact = MOCK_ARTIFACTS.find((a) => a.id === selectedArtifactId) ?? null

  function updateUrl(
    artifactId: string | null,
    versionNum: number | null,
    filter: ArtifactFilterType,
  ) {
    const params = new URLSearchParams(window.location.search)
    if (artifactId) params.set('artifact', artifactId)
    else params.delete('artifact')
    if (versionNum != null) params.set('version', String(versionNum))
    else params.delete('version')
    if (filter && filter !== 'all') params.set('filter', filter)
    else params.delete('filter')
    const qs = params.toString()
    window.history.replaceState({}, '', qs ? `?${qs}` : window.location.pathname)
  }

  function handleSelectArtifact(artifact: Artifact) {
    const vIdx = artifact.currentVersion
    setSelectedArtifactId(artifact.id)
    setSelectedVersionIndex(vIdx)
    setShowingDetail(true)
    updateUrl(artifact.id, artifact.versions[vIdx]?.version ?? null, filterType)
  }

  function handleVersionChange(index: number) {
    if (!selectedArtifact) return
    setSelectedVersionIndex(index)
    const v = selectedArtifact.versions[index]
    toast.success(`Viewing v${v.version}: "${v.label ?? `Version ${v.version}`}"`)
    updateUrl(selectedArtifact.id, v.version, filterType)
  }

  function handleFilterChange(type: ArtifactFilterType) {
    setFilterType(type)
    const vNum = selectedArtifact
      ? selectedArtifact.versions[selectedVersionIndex]?.version ?? null
      : null
    updateUrl(selectedArtifactId, vNum, type)
  }

  function handleBack() {
    setShowingDetail(false)
    setSelectedArtifactId(null)
    updateUrl(null, null, filterType)
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
        loading={loading}
        onSearchChange={setSearchQuery}
        onFilterChange={handleFilterChange}
        onSelect={handleSelectArtifact}
        hidden={showingDetail}
      />
      <ArtifactDetail
        artifact={selectedArtifact}
        selectedVersionIndex={selectedVersionIndex}
        onVersionChange={handleVersionChange}
        onBack={handleBack}
        visible={showingDetail}
      />
    </section>
  )
}

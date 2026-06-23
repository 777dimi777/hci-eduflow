import { createContext, useContext, useEffect, useState } from 'react'

const MaterialContext = createContext(null)

const STORAGE_KEY = 'eduflow-materials'

function loadMaterials() {
  const savedMaterials = localStorage.getItem(STORAGE_KEY)

  if (!savedMaterials) {
    return []
  }

  try {
    const parsedMaterials = JSON.parse(savedMaterials)

    if (!Array.isArray(parsedMaterials)) {
      return []
    }

    return parsedMaterials.map((material) => ({
      ...material,
      tags: Array.isArray(material.tags) ? material.tags : [],
    }))
  } catch {
    return []
  }
}

export function MaterialProvider({ children }) {
  const [materials, setMaterials] = useState(loadMaterials)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(materials))
  }, [materials])

  function addMaterial(materialData) {
    const newMaterial = {
      id: Date.now(),
      subjectId: Number(materialData.subjectId),
      title: materialData.title.trim(),
      type: materialData.type,
      description: materialData.description.trim(),
      url: materialData.url,
      tags: materialData.tags,
      createdAt: new Date().toISOString(),
    }

    setMaterials((previousMaterials) => [
      newMaterial,
      ...previousMaterials,
    ])

    return newMaterial
  }

  function updateMaterial(materialId, materialData) {
    setMaterials((previousMaterials) =>
      previousMaterials.map((material) =>
        material.id === materialId
          ? {
              ...material,
              subjectId: Number(materialData.subjectId),
              title: materialData.title.trim(),
              type: materialData.type,
              description: materialData.description.trim(),
              url: materialData.url,
              tags: materialData.tags,
            }
          : material
      )
    )
  }

  function deleteMaterial(materialId) {
    setMaterials((previousMaterials) =>
      previousMaterials.filter((material) => material.id !== materialId)
    )
  }

  function deleteMaterialsBySubjectId(subjectId) {
    setMaterials((previousMaterials) =>
      previousMaterials.filter(
        (material) => material.subjectId !== Number(subjectId)
      )
    )
  }

  return (
    <MaterialContext.Provider
      value={{
        materials,
        addMaterial,
        updateMaterial,
        deleteMaterial,
        deleteMaterialsBySubjectId,
      }}
    >
      {children}
    </MaterialContext.Provider>
  )
}

export function useMaterials() {
  const context = useContext(MaterialContext)

  if (!context) {
    throw new Error(
      'useMaterials mora da se koristi unutar MaterialProvider komponente.'
    )
  }

  return context
}
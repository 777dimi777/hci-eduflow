import {
  formatMaterialDate,
  getMaterialType,
} from '../utils/materialUtils'
import { getSubjectColorValue } from '../utils/subjectColorUtils'

function MaterialListItem({
  material,
  subject,
  isSelected,
  isDeleting,
  onSelect,
}) {
  const type = getMaterialType(material.type)

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect(material.id)
    }
  }

  return (
    <article
      className={[
        'material-list-item',
        isSelected ? 'material-list-item-selected' : '',
        isDeleting ? 'material-list-item-leaving' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        '--subject-color': subject
          ? getSubjectColorValue(subject.color)
          : '#94a3b8',
      }}
      role="button"
      tabIndex="0"
      onClick={() => onSelect(material.id)}
      onKeyDown={handleKeyDown}
    >
      <div className="material-list-item-icon">
        <i className={`bi ${type.icon}`}></i>
      </div>

      <div className="material-list-item-content">
        <div className="material-list-item-top">
          <span className="material-list-subject">
            <span className="material-list-subject-dot"></span>
            {subject ? subject.code : 'Obrisan predmet'}
          </span>

          <small>{formatMaterialDate(material.createdAt)}</small>
        </div>

        <strong>{material.title}</strong>

        <p>
          {material.description || type.label}
        </p>

        {material.tags.length > 0 && (
          <div className="material-list-tags">
            {material.tags.slice(0, 2).map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}

            {material.tags.length > 2 && (
              <span>+{material.tags.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

export default MaterialListItem
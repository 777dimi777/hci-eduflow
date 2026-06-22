const statusLabels = {
  todo: 'Nije početo',
  'in-progress': 'U toku',
  done: 'Završeno',
}

function TaskStatusBadge({ status }) {
  return (
    <span className={`task-status-badge task-status-${status}`}>
      {statusLabels[status]}
    </span>
  )
}

export default TaskStatusBadge
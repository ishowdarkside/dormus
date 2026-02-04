package models

import "slices"

type KanbanTaskPriority int

const (
	KanbanTaskPriorityLow    KanbanTaskPriority = 1
	KanbanTaskPriorityMedium KanbanTaskPriority = 2
	KanbanTaskPriorityHigh   KanbanTaskPriority = 3
)

func (p KanbanTaskPriority) Validate() bool {
	return slices.Contains([]KanbanTaskPriority{KanbanTaskPriorityLow, KanbanTaskPriorityMedium, KanbanTaskPriorityHigh}, p)
}

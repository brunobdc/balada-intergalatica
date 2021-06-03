package entity

import "github.com/google/uuid"

type Id string

func NewId() Id {
	return Id(uuid.New().String())
}

func ParseId(id uuid.UUID) Id {
	return Id(id.String())
}

func (id Id) String() string {
	return string(id)
}

package entity

type Club struct {
	id          Id
	name        string
	bannedItems []string
}

func NewClub(name string) Club {
	return Club{NewId(), name, nil}
}

func ParseClub(id Id, name string, bannedItems []string) Club {
	return Club{id, name, bannedItems}
}

func (club Club) Id() string {
	return club.id.String()
}

func (club Club) Name() string {
	return club.name
}

func (club Club) BannedItems() []string {
	return club.bannedItems
}

package entity

import (
	"time"
)

type Alien struct {
	id        Id
	name      string
	birthdate time.Time
	banned    bool
}

func NewAlien(name string, birthdate time.Time) Alien {
	return Alien{NewId(), name, birthdate, false}
}

func ParseAlien(id Id, name string, birthdate time.Time, banned bool) Alien {
	return Alien{id, name, birthdate, banned}
}

func (a Alien) Id() string {
	return a.id.String()
}

func (a Alien) Name() string {
	return a.name
}

func (a Alien) Birthdate() time.Time {
	return a.birthdate
}

func (a Alien) IsBanned() bool {
	return a.banned
}

func (a Alien) Age() int {
	todayYear, todayMonth, todayDay := time.Now().Date()
	birthYear, birthMonth, birthDay := a.birthdate.Date()

	age := todayYear - birthYear

	if birthMonth == todayMonth && birthDay > todayDay {
		age--
	} else if int(birthMonth) > int(todayMonth) {
		age--
	}

	return age
}

package alien

import "github.com/brunobdc/balada-intergalatica/domain/entity"

type UseCase interface {
	InserAlien(alien entity.Alien)
	UpdateAlien(alien entity.Alien)
	FindAlienById(id entity.Id) entity.Alien
}

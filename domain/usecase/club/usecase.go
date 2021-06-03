package club

import "github.com/brunobdc/balada-intergalatica/domain/entity"

type UseCase interface {
	InsertClub(club entity.Club)
	UpdateClub(club entity.Club)
}

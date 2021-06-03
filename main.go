package main

import (
	"fmt"
	"time"

	"github.com/brunobdc/balada-intergalatica/domain/entity"
	"syreclabs.com/go/faker"
)

func main() {
	birthdate, _ := time.Parse("02/01/2006", "17/09/1997")
	alien := entity.NewAlien(faker.App().Name(), birthdate)

	fmt.Println(alien.Age())
}

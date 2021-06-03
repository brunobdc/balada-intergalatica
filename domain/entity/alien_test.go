package entity_test

import (
	"testing"
	"time"

	"github.com/brunobdc/balada-intergalatica/domain/entity"
	"syreclabs.com/go/faker"
)

func TestAge(t *testing.T) {
	birthdate, error := time.Parse("02/01/2006", "17/09/1997")
	if error != nil {
		t.Errorf("Erro ao parsear data")
	}
	alien := entity.NewAlien(faker.App().Name(), birthdate)
	got := alien.Age()
	expected := 23

	if got != expected {
		t.Errorf("Got %d and Expected %d", got, expected)
	}
}

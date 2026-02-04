package common

import "github.com/nyaruka/phonenumbers"

func FormatPhoneNumber(number, region string) string {
	num, err := phonenumbers.Parse(number, region)
	if err != nil {
		panic(err)
	}

	return phonenumbers.Format(num, phonenumbers.E164)

}

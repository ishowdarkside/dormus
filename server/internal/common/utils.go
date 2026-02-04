package common

func ContainsNegativeOrZero(s []int) bool {

	for _, value := range s {
		if value <= 0 {
			return true
		}
	}

	return false
}

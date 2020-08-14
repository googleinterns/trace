import numpy as np
import json
_POPULATION = 'datasets/county-population.txt'
_CASES = 'datasets/by-county-and-date.txt'
_COORDINATES = 'datasets/usa_county_wise.txt'
_WADE_HAMPTON_CENSUS_AK = 96
_GRAND_PRINCESS_CRUISE_CA = 193
_NEW_YORK_CITY_UNALLOCATED = 1864
_IGNORE_LOCATIONS = [_WADE_HAMPTON_CENSUS_AK, _GRAND_PRINCESS_CRUISE_CA, _NEW_YORK_CITY_UNALLOCATED]
us_state_abbrev = {
    'Alabama': 'AL',
    'Alaska': 'AK',
    'American Samoa': 'AS',
    'Arizona': 'AZ',
    'Arkansas': 'AR',
    'California': 'CA',
    'Colorado': 'CO',
    'Connecticut': 'CT',
    'Delaware': 'DE',
    'District of Columbia': 'DC',
    'Florida': 'FL',
    'Georgia': 'GA',
    'Guam': 'GU',
    'Hawaii': 'HI',
    'Idaho': 'ID',
    'Illinois': 'IL',
    'Indiana': 'IN',
    'Iowa': 'IA',
    'Kansas': 'KS',
    'Kentucky': 'KY',
    'Louisiana': 'LA',
    'Maine': 'ME',
    'Maryland': 'MD',
    'Massachusetts': 'MA',
    'Michigan': 'MI',
    'Minnesota': 'MN',
    'Mississippi': 'MS',
    'Missouri': 'MO',
    'Montana': 'MT',
    'Nebraska': 'NE',
    'Nevada': 'NV',
    'New Hampshire': 'NH',
    'New Jersey': 'NJ',
    'New Mexico': 'NM',
    'New York': 'NY',
    'North Carolina': 'NC',
    'North Dakota': 'ND',
    'Northern Mariana Islands':'MP',
    'Ohio': 'OH',
    'Oklahoma': 'OK',
    'Oregon': 'OR',
    'Pennsylvania': 'PA',
    'Puerto Rico': 'PR',
    'Rhode Island': 'RI',
    'South Carolina': 'SC',
    'South Dakota': 'SD',
    'Tennessee': 'TN',
    'Texas': 'TX',
    'Utah': 'UT',
    'Vermont': 'VT',
    'Virgin Islands': 'VI',
    'Virginia': 'VA',
    'Washington': 'WA',
    'West Virginia': 'WV',
    'Wisconsin': 'WI',
    'Wyoming': 'WY'
}


# Loads data from all three datasets above and returns a
# python dict that maps a county's name to its coordinates
# and a covid risk weight based on recency of outbreak
# at that locationa and that county's population
def load_covid_data():
    county_to_coordinates = read_county_wise()
    population_map = load_population_map(county_to_coordinates)
    weighted_cases = load_weighted_cases(population_map)
    i = 0
    for county in population_map:
        population_map[county]["weight"] = int(weighted_cases[i]
          / population_map[county]["weight"]) # Normalizes weights by population density.
        i += 1
    return population_map


# Reads file to create a python dict that
# maps county names to their coordinates.
def read_county_wise():
    county_coordinates = {}
    line_count = 0
    f = open(_COORDINATES, "r")
    for line in f:
        if line_count > 1:  # Skip first two lines.
            coords = {}
            row = line.split(',')
            key = format_county_state(row[5], row[6])
            # If we find a new key.
            if len(key) > 0 and (key not in county_coordinates):
                coords["lat"] = float(row[8])
                coords["lng"] = float(row[9])
                county_coordinates[key] = coords
        line_count += 1
    return county_coordinates


# Formats a county and state such as Sonoma and Washington
# as Sonoma, WA
def format_county_state(county, state):
    key = ""
    if state in us_state_abbrev:
        key = county + ", " + us_state_abbrev[state]
    return key


# Reads county-population.txt and returns python dict that matches
# a county's name to its coordinates and relative population (population / 100)
def load_population_map(county_to_coordinates):
    population_map = {}
    line_count = 0
    f = open(_POPULATION, "r")
    for line in f:
        if line_count <= 1 or (line_count in _IGNORE_LOCATIONS): # Skip invalid lines
            line_count += 1
            continue
        else: 
            row = line.split(',')
            update_population_map(population_map, county_to_coordinates, row, line_count)
            line_count += 1
    return population_map


# Checks whether the current location has a non-zero population and 
# corresponding coordinates before adding this data into the map.
def update_population_map(population_map, county_to_coordinates, row, line_count):
    # Ignore locations where population = 0
    if (row[1] == "Statewide Unallocated") or (int(row[-1]) == 0):
        return
    
    county = ''.join(row[1].split()[:-1])  # Removes 'county' and 'borough' from county names
    key = county + ", " + row[2]
    # If we know its coordinates and haven't seen it before
    if (key in county_to_coordinates) and (key not in population_map):
        location_object = {
            "location": county_to_coordinates[key],  # County coordinates
            "weight": int(row[-1]) / 100  # County population / 100
        }
        population_map[key] = location_object
    else:
        _IGNORE_LOCATIONS.append(line_count)
    return


# This function accepts a file that lists the total cases of a county on each consecutive date
# and returns a numpy array where each entry represents the weight of a given U.S.
# county where weight = sum(newCasePerDay * index) so as to weight more recent cases heavier than
# older ones.
def load_weighted_cases(population_map):
    case_matrix = []  # Each row is a county, each column is the total for given day.
    line_count = 0
    f = open(_CASES, "r")
    for line in f:
        if line_count != 0:  # skip first line
            row = line.split(',')
            county = ''.join(row[1].split()[:-1])  # Remove 'county' and 'borough' from county name
            key = county + ", " + row[2]

            # If this is a new key that we should not ignore, append the available data to our matrix.
            if key in population_map and (line_count not in _IGNORE_LOCATIONS):
                case_matrix.append([int(num) for num in row[3:]])  # List of daily total for this county
        line_count += 1
    new_cases_matrix = np.diff(np.array(case_matrix))  #  New cases per day per county

    # Multiplies each new case total by its index in its subarray to weight more recent cases heavier
    weighted_cases = np.array([np.arange(len(sublist)).dot(sublist) for sublist in new_cases_matrix])  # len = num_counties
    return weighted_cases


coord_weight_map = load_covid_data()
#dump_file_path = 'heatWeights.txt'
#with open(dump_file_path, 'w') as outfile:
#    json.dump(coord_weight_map, outfile)

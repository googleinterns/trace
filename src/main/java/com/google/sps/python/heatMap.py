import numpy as np
import json
popFile = 'datasets/county-population.txt'
caseFile = 'datasets/by-county-and-date.txt'
coordFile = 'datasets/usa_county_wise.txt'
ignoreLocations = [96, 193, 1863]  # Edge case locations where I know the population is 0 (ex: Princess Cruise Ship)
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
def loadCovidData():
    countyToCoords = readCountyWise(coordFile)
    popMap = loadPopMap(popFile, countyToCoords)
    weightedCases = loadWeightedCases(caseFile, popMap)
    i = 0
    for county in popMap:
        popMap[county]["weight"] = int(weightedCases[i]
          / popMap[county]["weight"]) # Normalizes weights by population density.
        i += 1
    return popMap


# Reads file to create a python dict that
# maps county names to their coordinates.
def readCountyWise(file):
    countyCoords = {}
    line_count = 0
    f = open(file, "r")
    for line in f:
        if line_count > 1:  # Skip first two lines.
            coords = {}
            row = line.split(',')
            key = formatCountyState(row[5], row[6])
            # If we find a new key.
            if len(key) > 0 and (key not in countyCoords):
                coords["lat"] = float(row[8])
                coords["lng"] = float(row[9])
                countyCoords[key] = coords
        line_count += 1
    return countyCoords


# Formats a county and state such as Sonoma and Washington
# as Sonoma, WA
def formatCountyState(county, state):
    key = ""
    if state in us_state_abbrev:
        key = county + ", " + us_state_abbrev[state]
    return key


# Reads county-population.txt and returns python dict that matches
# a county's name to its coordinates and relative population (population / 100)
def loadPopMap(file, countyToCoords):
    popMap = {}
    line_count = 0
    f = open(file, "r")
    for line in f:
        if line_count > 1 and (line_count not in ignoreLocations):  # Skip first two lines.
            row = line.split(',')
            # Ignores unallocated cases and locations where population = 0.
            if row[1] != "Statewide Unallocated" and int(row[-1]) != 0:
                county = ''.join(row[1].split()[:-1])  # Removes 'county' and 'borough' from county names
                key = county + ", " + row[2]
                # If we know its coordinates and haven't seen it before
                if key in countyToCoords and (key not in popMap):
                    locationObject = {
                        "location": countyToCoords[key],  # County coordinates
                        "weight": int(row[-1]) / 100  # County population / 100
                        }
                    popMap[key] = locationObject
                else:
                    ignoreLocations.append(line_count)  #Locations to be ignored when creating the weight matrix.
        line_count += 1
    return popMap


# This function accepts a file that lists the total cases of a county on each consecutive date
# and returns a numpy array where each entry represents the weight of a given U.S.
# county where weight = sum(newCasePerDay * index) so as to weight more recent cases heavier than
# older ones.
def loadWeightedCases(file, popMap):
    caseMatrix = []  # Each row is a county, each column is the total for given day.
    line_count = 0
    f = open(file, "r")
    for line in f:
        if line_count != 0:  # skip first line
            row = line.split(',')
            county = ''.join(row[1].split()[:-1])  # Remove 'county' and 'borough' from county name
            key = county + ", " + row[2]
            if key in popMap and (line_count not in ignoreLocations):
                caseMatrix.append([int(num) for num in row[3:]])  # List of daily total for this county
        line_count += 1
    newCaseMatrix = np.diff(np.array(caseMatrix))  #  New cases per day per county

    # Multiplies each new case total by its index in its subarray to weight more recent cases heavier
    weightedCases = np.array([np.arange(len(sublist)).dot(sublist) for sublist in newCaseMatrix])  # len = num_counties
    return weightedCases


coordWeightMap = loadCovidData()
dumpFilePath = 'heatWeights.txt'
with open(dumpFilePath, 'w') as outfile:
    json.dump(coordWeightMap, outfile)

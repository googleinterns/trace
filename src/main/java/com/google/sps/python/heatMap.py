import numpy as np
import json
popFile = 'datasets/county-population.txt'
caseFile = 'datasets/by-county-and-date.txt'


def loadCovidData():
    emptyLocations = [96, 193, 1863]  # Edge case locations where I know the population is 0 (ex: Princess Cruise Ship)
    popMap = loadPopMap(popFile)  # county: population
    weightedCases = loadWeightedCases(caseFile, emptyLocations)
    i = 0
    for county in popMap:
        popMap[county] = int(weightedCases[i] / popMap[county]) # Normalizes weights by population density.
    return popMap


def loadPopMap(file):
    popMap = {}
    line_count = 0
    f = open(file, "r")
    for line in f:
        if line_count > 1:
            row = line.split(',')
            if row[1] != "Statewide Unallocated" and int(row[-1]) != 0:
                key = row[1] + ", " + row[2]
                popMap[key] = int(row[-1]) / 100  # Divide by 100 to avoid large denominator
        line_count += 1
    return popMap


# This function accepts a file that lists the total cases of a county on each consecutive date
# and returns a numpy array where each entry represents the weight of a given U.S.
# county where weight = sum(newCasePerDay * index) so as to weight more recent cases heavier than
# older ones.
def loadWeightedCases(file, emptyLocations):
    caseMatrix = []  # Each row is a county, each column is the total cases for that day.
    line_count = 0
    f = open(file, "r")
    for line in f:
        if line_count != 0:  # skip first line
            row = line.split(',')
            if row[1] != "Statewide Unallocated" and (line_count not in emptyLocations):
                caseMatrix.append([int(num) for num in row[3:]])
        line_count += 1
    newCaseMatrix = np.diff(np.array(caseMatrix)) #  New cases per day

    # Multiplies each new case total by its index in its subarray to weight more recent cases heavier
    weightedCases = np.array([np.arange(len(sublist)).dot(sublist) for sublist in newCaseMatrix])  # len = num_counties
    return weightedCases


popMap = loadCovidData()
dumpFilePath = 'heatWeights.txt'
with open(dumpFilePath, 'w') as outfile:
    json.dump(popMap, outfile)

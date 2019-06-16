# DLRG Fetch

This package helps you fetch information of DLRG divisions.

## Installation

Install using yarn:

```
yarn global add dlrg-fetch
```

Install using npm:

```
npm i -g dlrg-fetch
```

## How to use

This package will install a `dlrg-fetch` binary for easy access.

Basic usage:

```
dlrg-fetch --radius 50 --long 10.161930 --lat 48.696891
```

This will fetch all DLRG divisions in a radius of 50 km around the point specified by latitude / longitude and save them in a `results.csv` file inside the current directory.

Options:

- `--recordType` 1 (default) = main divisions, 2 = youth divisions
- `--targetFile` results file path; default: './results.csv'


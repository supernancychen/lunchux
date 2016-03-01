var Constant = {
  gOften : ['Weekly','Bi-Weekly','2xMonth','Monthly'],
  gState:["AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"],
  gEthnicity : ['Hispanic or Latino','Not Hispanic or Latino'],
  gRace:['American Indian or Alaskan Native','Asian','Black or African American','Native Hawaiian or Other Pacific Islander','White'],
  gAdultIncomeType : {
    'work': ['Salary', 'Wages', 'Cash bonuses', 'Self-employment', 'Strike benefits', 'Unemployment', 'Insurance', 'Any other earned income', ' ', 'Remove'],
    'military': ['Basic pay', 'Cash bonuses', 'Allowances for offbase', 'housing, food, and clothing', ' ', 'Remove'],
    'assistance': ['General assistance (excluding SNAP or TANF)', 'Any other public assistance, alimony received, or child support received', ' ', 'Remove'],
    'retirement': ['Social Security', 'Railroad retirement', 'Pensions', 'Annuities', 'Survivor’s benefits', 'Disability benefits from Supplemental Security Income (SSI)', 'Private disability benefits', 'Black lung benefits', 'Worker’s compensation', 'Veteran’s benefits', 'Related sources', ' ', 'Remove'],
    'otherAdultIncome': ['Interest', 'Dividends', 'Income from trusts or estates', 'Rental income', 'Royalties', 'Prize winnings', 'Money withdrawn from savings', ' ', 'Remove']
  },
  gKidsFeatureLabel:{'isStudent':'Student','isFoster':'Foster child','isHomeless':'Homeless, Migrant, Runaway'},
  gKidsIncomeLabel:{'incomeSalary':'Salary or wages from a job',
          'SSBenefit':'Social Security benefits',
          'outerPerson':'Spending money or other income from a person outside the household',
          'otherIncome':'Income from any other source'
  },
  gAdultsIncomeLabel:{'work':'Work income',
          'military':'U.S. military income',
          'assistance':'Public assistance, alimony, or child support',
          'retirement':'Retirement or disability income',
          'otherAdultIncome':'Investment or any other income'
  }
};

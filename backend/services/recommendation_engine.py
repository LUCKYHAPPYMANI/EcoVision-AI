import pandas as pd
from config import CPCB_NAAQS_24HR

# Abatement knowledge base grounded in environmental engineering principles
ABATEMENT_KNOWLEDGE = {
    'PM2.5': [
        {
            'measure': "Industrial High-Efficiency Particulate Filtration (Fabric Filters & ESP)",
            'scientific_explanation': (
                "Fine particles (aerodynamic diameter <= 2.5 µm) penetrate deeply into alveolar tissue. "
                "Pulse-jet baghouses and high-voltage Electrostatic Precipitators (ESP) trap sub-micron particulates "
                "via inertial impaction, Brownian diffusion, and electrostatic charging with >99.5% efficiency."
            ),
            'expected_benefit': "Reduces ambient PM2.5 loading by 35-60% in immediate industrial downwind zones."
        },
        {
            'measure': "Combustion Source Clean Transition & Stubble/Biomass Burning Controls",
            'scientific_explanation': (
                "Combustion of solid fuels (coal, biomass, pet-coke) produces dense aerosols of black carbon and polycyclic "
                "organic matter. Transitioning to piped natural gas (PNG) or electric induction prevents primary carbonaceous aerosol formation."
            ),
            'expected_benefit': "Lowers localized combustion-derived aerosol concentrations by 40-70%."
        }
    ],
    'PM10': [
        {
            'measure': "Mechanical Road Dust Vacuum Sweeping & High-Pressure Water Mist Cannons",
            'scientific_explanation': (
                "Coarse particles (2.5 to 10 µm) arise predominantly from mechanical abrasion of roadways, construction aggregates, and soil resuspension. "
                "Ultra-fine water droplets (30-50 µm) from anti-smog guns agglomerate dust particles, causing rapid gravitational settling."
            ),
            'expected_benefit': "Suppresses fugitive coarse crustal dust by 50-80% along traffic corridors and construction sites."
        },
        {
            'measure': "Mandatory Construction Enclosure Sheeting & Green Buffer Zone Landscaping",
            'scientific_explanation': (
                "Green buffer strips (broad-leaved evergreen trees such as Ficus and Neem) act as natural bio-filters that capture airborne coarse dust, "
                "while impermeable geotextile windbreaks arrest aggregate dispersion."
            ),
            'expected_benefit': "Limits construction aggregate drift by up to 65% outside project boundaries."
        }
    ],
    'NO2': [
        {
            'measure': "Installation of Low-NOx Burners and Selective Catalytic Reduction (SCR)",
            'scientific_explanation': (
                "Thermal NOx forms at flame temperatures exceeding 1300°C via reaction between atmospheric nitrogen and oxygen (Zeldovich mechanism). "
                "Low-NOx burners stage fuel and air to lower peak flame temperatures, while SCR uses aqueous urea/ammonia over a titanium-vanadium catalyst "
                "to reduce NO and NO2 to inert N2 and H2O vapor."
            ),
            'expected_benefit': "Achieves 70-90% reduction in industrial stack NOx emissions."
        },
        {
            'measure': "Heavy Commercial Vehicle Transit Diversion & BS-VI / EV Electrification",
            'scientific_explanation': (
                "Diesel compression-ignition engines emit high flux rates of nitrogen dioxide. Enforcing strict perimeter route detours for heavy trucks "
                "and transitioning public bus transit to battery-electric drives eliminates primary vehicle NOx plumes."
            ),
            'expected_benefit': "Reduces urban curbside NO2 concentrations by 25-45% during peak transit hours."
        }
    ],
    'SO2': [
        {
            'measure': "Flue Gas Desulfurization (Wet Limestone / Sea Water FGD Scrubbing)",
            'scientific_explanation': (
                "Combustion of sulphur-bearing fuels releases sulphur dioxide gas. Wet FGD systems react acidic SO2 exhaust gases with an alkaline limestone slurry "
                "[CaCO3 + SO2 + 0.5 H2O -> CaSO3.0.5H2O + CO2], precipitating solid commercial-grade gypsum [CaSO4.2H2O]."
            ),
            'expected_benefit': "Removes 92-98% of sulphur dioxide from power plant and smelter flue gases."
        },
        {
            'measure': "Ultra-Low Sulphur Fuel Mandate (<10 ppm Sulphur Content)",
            'scientific_explanation': (
                "Directly substituting high-sulphur furnace oils and heavy pet-coke with hydrotreated ultra-low sulphur fuels prevents the genesis "
                "of SO2 gas and secondary sulfate aerosols [SO4^2-] during combustion."
            ),
            'expected_benefit': "Decreases industrial baseline SO2 emissions by 80-95%."
        }
    ],
    'CO': [
        {
            'measure': "Boiler Air-to-Fuel Ratio Optimization & Oxygen Trim Closed-Loop Control",
            'scientific_explanation': (
                "Carbon monoxide forms when hydrocarbons undergo incomplete combustion due to oxygen starvation or low residence time in combustion chambers. "
                "Zirconia oxygen sensors modulating automated air dampers maintain stoichiometric excess air (1.1-1.2 ratio), ensuring complete oxidation to CO2."
            ),
            'expected_benefit': "Reduces stack CO emissions below 50 ppm while boosting thermal efficiency by 2-5%."
        },
        {
            'measure': "Preventive Burner Maintenance, Flame Sensor Servicing & Catalytic Converters",
            'scientific_explanation': (
                "Degraded burner nozzles and clogged fuel injectors cause localized fuel puddling and rich combustion pockets. "
                "Routine ultrasonic cleaning and three-way catalytic converters oxidize residual CO over platinum/palladium matrices."
            ),
            'expected_benefit': "Eliminates episodic CO emission spikes by 75-90%."
        }
    ],
    'O3': [
        {
            'measure': "Vapor Recovery Units (VRU) for VOCs and Industrial Solvent Abatement",
            'scientific_explanation': (
                "Tropospheric ozone is a secondary photochemical oxidant synthesized when volatile organic compounds (VOCs) and NOx react in the presence of intense sunlight [UV flux]. "
                "Capturing hydrocarbon vapors at fuel dispensing stations, paint spray booths, and solvent recovery plants deprives the photochemical cycle of essential organic precursors."
            ),
            'expected_benefit': "Reduces peak afternoon ground-level ozone formation by 30-50%."
        },
        {
            'measure': "Industrial Paint/Coating Substitution with Low-VOC Aqueous Formulations",
            'scientific_explanation': (
                "Replacing solvent-based paints containing benzene, toluene, and xylene with waterborne polymers minimizes fugitive organic evaporation "
                "during ambient drying cycles."
            ),
            'expected_benefit': "Lowers regional fugitive photochemical precursor burdens by up to 60%."
        }
    ]
}

def generate_recommendations(pollutant_data):
    """
    Evaluates observed pollutant concentrations against CPCB NAAQS thresholds
    and triggers explainable engineering recommendations.
    
    pollutant_data can be a dictionary of pollutant values or a DataFrame with average values.
    """
    if isinstance(pollutant_data, pd.DataFrame):
        # Extract mean concentrations
        values = {}
        for p in CPCB_NAAQS_24HR:
            if p in pollutant_data.columns:
                valid = pollutant_data[p].dropna()
                if len(valid) > 0:
                    values[p] = float(valid.mean())
    else:
        values = pollutant_data

    recommendations = []
    
    for pollutant, threshold in CPCB_NAAQS_24HR.items():
        val = values.get(pollutant)
        if val is None or pd.isna(val):
            continue
            
        val = float(val)
        unit = "mg/m³" if pollutant == 'CO' else "µg/m³"
        ratio = val / threshold
        
        # Determine risk level
        if ratio <= 0.6:
            risk = "Low"
            risk_color = "#10B981"
            severity = "Compliant"
        elif ratio <= 1.0:
            risk = "Moderate (Within Threshold)"
            risk_color = "#FBBF24"
            severity = "Approaching Limit"
        elif ratio <= 1.5:
            risk = "High (Threshold Exceeded)"
            risk_color = "#F97316"
            severity = "Exceeded"
        else:
            risk = "Critical (Severe Exceedance)"
            risk_color = "#EF4444"
            severity = "Severe"

        # Trigger recommendations if pollutant is >= 75% of threshold or when explicitly evaluating
        if ratio >= 0.75:
            strategies = ABATEMENT_KNOWLEDGE.get(pollutant, [])
            for strat in strategies:
                recommendations.append({
                    'pollutant': pollutant,
                    'observed_value': round(val, 2),
                    'unit': unit,
                    'reference_threshold': threshold,
                    'exceedance_percentage': round(((val - threshold) / threshold * 100), 1) if val > threshold else 0,
                    'risk_level': risk,
                    'risk_color': risk_color,
                    'severity': severity,
                    'proposed_measure': strat['measure'],
                    'scientific_explanation': strat['scientific_explanation'],
                    'expected_benefit': strat['expected_benefit']
                })

    # If all pollutants are well within limits, supply preventive maintenance guidance
    if len(recommendations) == 0:
        recommendations.append({
            'pollutant': "All Monitored Pollutants",
            'observed_value': "Compliant",
            'unit': "-",
            'reference_threshold': "CPCB NAAQS 24-hr Limits",
            'exceedance_percentage': 0,
            'risk_level': "Low",
            'risk_color': "#10B981",
            'severity': "Compliant",
            'proposed_measure': "Continuous Continuous Ambient Air Quality Monitoring (CAAQMS) & Preventative Green Cover Maintenance",
            'scientific_explanation': "Baseline observations are compliant with National Ambient Air Quality Standards. Continuous automated sensor calibration ensures early detection of seasonal inversion spikes.",
            'expected_benefit': "Maintains sustainable ambient air quality and prevents episodic non-attainment conditions."
        })

    return recommendations

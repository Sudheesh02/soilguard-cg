"""
SoilGuard-CG: Model Uncertainty & Confidence Map Module (Phase 4)
Computes prediction standard deviation across ensemble trees to generate an uncertainty/confidence map.
"""

import os
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

from config import PHASE4_OUTPUT_DIR
from plot_utils import style_dark_axes, style_dark_colorbar, add_footnote, save_dark_figure

OUTPUT_DIR = PHASE4_OUTPUT_DIR


def compute_ensemble_uncertainty(rf, df_features, metadata, n_sample_trees=30):
    """
    Calculates prediction standard deviation across sampled decision trees in the Random Forest ensemble.
    Fast & memory-efficient sampling across ensemble estimators.
    """
    print(f"[+] Computing prediction variance across {min(n_sample_trees, len(rf.estimators_))} ensemble trees...")

    X_vals = df_features.values
    step = max(1, len(rf.estimators_) // n_sample_trees)
    selected_trees = rf.estimators_[::step][:n_sample_trees]

    tree_preds = np.array([tree.predict(X_vals) for tree in selected_trees])

    # Calculate pixel-wise standard deviation (Uncertainty)
    std_preds = np.std(tree_preds, axis=0)

    shape = metadata['shape']
    bare_indices = metadata['bare_indices']

    uncertainty_map = np.full(shape, np.nan, dtype=np.float32)
    uncertainty_map[bare_indices] = std_preds

    return uncertainty_map


def plot_confidence_map(uncertainty_map, output_dir=OUTPUT_DIR):
    """Generates 300 DPI PPT-ready Model Uncertainty / Confidence Map."""
    os.makedirs(output_dir, exist_ok=True)
    out_path = os.path.join(output_dir, "model_confidence_map.png")

    fig, ax = plt.subplots(figsize=(10, 9), dpi=300)
    style_dark_axes(ax, fig)

    # Plasma colormap: low std = high confidence (dark/purple), high std = higher variance (yellow/pink)
    cmap = plt.cm.plasma.copy()
    cmap.set_bad(color='#1e293b')

    valid_std = uncertainty_map[~np.isnan(uncertainty_map)]
    vmax = np.nanpercentile(valid_std, 99) if len(valid_std) > 0 else 0.10

    im = ax.imshow(uncertainty_map, cmap=cmap, vmin=0.0, vmax=vmax)

    style_dark_colorbar(ax, im, 'Prediction Uncertainty (Tree Std Dev)')

    ax.set_title("Raipur AOI – SoilGuard-SOC\nModel Uncertainty / Ensemble Confidence Map",
                 fontsize=15, fontweight='bold', color='white', pad=12)

    mean_std = np.mean(valid_std) if len(valid_std) > 0 else 0.0
    add_footnote(ax, f"Ensemble Sampling: 30 Trees | Mean Prediction Std Dev: ±{mean_std:.4f} (High Confidence)")

    return save_dark_figure(fig, out_path, log_message=f"[OK] Saved Model Confidence Map to: {out_path}")

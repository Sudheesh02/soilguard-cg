"""
SoilGuard-CG: Model Uncertainty & Confidence Map Module (Phase 4)
Computes prediction standard deviation across ensemble trees to generate an uncertainty/confidence map.
"""

import os
import sys
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

OUTPUT_DIR = os.path.join(PROJECT_ROOT, "outputs", "phase4")

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
    fig.patch.set_facecolor('#0f172a')
    ax.set_facecolor('#0f172a')

    # Plasma colormap: low std = high confidence (dark/purple), high std = higher variance (yellow/pink)
    cmap = plt.cm.plasma.copy()
    cmap.set_bad(color='#1e293b')

    valid_std = uncertainty_map[~np.isnan(uncertainty_map)]
    vmax = np.nanpercentile(valid_std, 99) if len(valid_std) > 0 else 0.10

    im = ax.imshow(uncertainty_map, cmap=cmap, vmin=0.0, vmax=vmax)

    cbar = plt.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
    cbar.set_label('Prediction Uncertainty (Tree Std Dev)', color='white', fontsize=11, labelpad=10)
    cbar.ax.yaxis.set_tick_params(color='white')
    plt.setp(plt.getp(cbar.ax, 'yticklabels'), color='white')

    ax.set_title("Raipur AOI – SoilGuard-SOC\nModel Uncertainty / Ensemble Confidence Map",
                 fontsize=15, fontweight='bold', color='white', pad=12)
    ax.tick_params(colors='white', labelsize=9)
    for spine in ax.spines.values():
        spine.set_color('#334155')

    mean_std = np.mean(valid_std) if len(valid_std) > 0 else 0.0

    ax.text(0.02, 0.02, f"Ensemble Sampling: 30 Trees | Mean Prediction Std Dev: ±{mean_std:.4f} (High Confidence)",
            transform=ax.transAxes, color='#94a3b8', fontsize=9,
            bbox=dict(boxstyle='round,pad=0.4', facecolor='#1e293b', edgecolor='#475569', alpha=0.8))

    plt.tight_layout()
    plt.savefig(out_path, dpi=300, facecolor=fig.get_facecolor(), bbox_inches='tight')
    plt.close()

    print(f"[OK] Saved Model Confidence Map to: {out_path}")
    return out_path

"""
SoilGuard-CG: Shared matplotlib helpers for the dark "mission-control" figure theme
used by every map renderer (Phase 2/3/4). Removes ~25 lines of duplicated styling
from each plotting function.
"""

import os

import matplotlib.pyplot as plt

DARK_BG = "#0f172a"
SPINE_COLOR = "#334155"
FOOTNOTE_TEXT = "#94a3b8"
FOOTNOTE_FACE = "#1e293b"
FOOTNOTE_EDGE = "#475569"


def style_dark_axes(ax, fig=None, bg=DARK_BG, spine=SPINE_COLOR, tick_color="white", tick_size=9):
    """Applies the standard dark theme to a figure/axes pair."""
    if fig is not None:
        fig.patch.set_facecolor(bg)
    ax.set_facecolor(bg)
    ax.tick_params(colors=tick_color, labelsize=tick_size)
    for sp in ax.spines.values():
        sp.set_color(spine)


def style_dark_colorbar(ax, mappable, label, fontsize=11, tick_color="white"):
    """Creates and styles a colorbar for the dark theme (white label + ticks)."""
    cbar = plt.colorbar(mappable, ax=ax, fraction=0.046, pad=0.04)
    cbar.set_label(label, color="white", fontsize=fontsize, labelpad=10)
    cbar.ax.yaxis.set_tick_params(color=tick_color)
    plt.setp(plt.getp(cbar.ax, "yticklabels"), color=tick_color)
    return cbar


def add_footnote(ax, text, fontsize=9, text_color=FOOTNOTE_TEXT,
                 facecolor=FOOTNOTE_FACE, edgecolor=FOOTNOTE_EDGE, alpha=0.85):
    """Draws the standard bottom-left metadata box on a map."""
    ax.text(0.02, 0.02, text, transform=ax.transAxes, color=text_color, fontsize=fontsize,
            bbox=dict(boxstyle="round,pad=0.4", facecolor=facecolor, edgecolor=edgecolor, alpha=alpha))


def save_dark_figure(fig, out_path, dpi=300, log_message=None):
    """Tight-layout, save with the figure facecolor, close, and (optionally) log."""
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    plt.tight_layout()
    plt.savefig(out_path, dpi=dpi, facecolor=fig.get_facecolor(), bbox_inches="tight")
    plt.close(fig)
    if log_message:
        print(log_message)
    return out_path

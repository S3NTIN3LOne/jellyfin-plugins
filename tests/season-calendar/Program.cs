using System.Reflection;
using Jellyfin.Plugin.MediaBar.Helpers;

static void Check(bool condition, string message)
{
    if (!condition) throw new Exception(message);
}

var plugin = Assembly.GetExecutingAssembly();
foreach (var (month, day, expected) in new[] {
    (10, 14, "None"), (10, 15, "Halloween"), (10, 31, "Halloween"),
    (11, 1, "Halloween"), (11, 2, "None"), (12, 1, "Christmas"),
    (12, 31, "Christmas"), (1, 1, "None") })
{
    var now = new DateTime(2026, month, day, 23, 59, 59, DateTimeKind.Local);
    var status = SeasonalSchedule.Evaluate(now, plugin);
    Check(status.ActiveTheme == expected && status.Source == "Jelly+", $"Jelly+ boundary {month}/{day}");
    Check(status.ValidUntil == new DateTimeOffset(now.Date.AddDays(1)).ToUnixTimeMilliseconds(), "Server midnight");
}
foreach (var (month, day, expected) in new[] {
    (9, 30, "None"), (10, 1, "Halloween"), (10, 31, "Halloween"),
    (11, 1, "None"), (11, 30, "None"), (12, 1, "Christmas"), (12, 31, "Christmas"), (1, 1, "None") })
{
    var status = SeasonalSchedule.Evaluate(new DateTime(2026, month, day), null);
    Check(status.ActiveTheme == expected && status.Source == "Fallback", $"Fallback boundary {month}/{day}");
}
Jellyplus.Rules.Provider = date => date.Month == 7 ? "Halloween" : null;
Check(SeasonalSchedule.Evaluate(new DateTime(2026, 7, 3), plugin).ActiveTheme == "Halloween", "Use plugin changes rather than copied dates");
Jellyplus.Rules.Provider = _ => throw new InvalidOperationException();
Check(SeasonalSchedule.Evaluate(new DateTime(2026, 10, 20), plugin).ActiveTheme == "None", "Broken plugin must not use fallback");
Check(SeasonalSchedule.Evaluate(new DateTime(2026, 10, 20), typeof(string).Assembly).ActiveTheme == "None", "Missing contract must not use fallback");
Console.WriteLine("Server season calendar: Jelly+ reflection, modified rules, boundaries, fallback and failures verified.");

// Contract fixture matching Jelly+ Rules.Season(DateOnly); dates can change without Media Bar changes.
namespace Jellyplus
{
    public static class Rules
    {
        public static Func<DateOnly, string?> Provider = date => date.Month == 12 ? "Weihnachten"
            : (date.Month == 10 && date.Day >= 15) || (date.Month == 11 && date.Day == 1) ? "Halloween" : null;
        public static string? Season(DateOnly date) => Provider(date);
    }
}

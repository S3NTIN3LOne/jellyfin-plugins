using System.Reflection;

namespace Jellyfin.Plugin.MediaBar.Helpers;

public sealed record SeasonalStatus(string ActiveTheme, string Source, long ValidUntil);

public static class SeasonalSchedule
{
    public static SeasonalStatus GetStatus() => Evaluate(DateTime.Now,
        AppDomain.CurrentDomain.GetAssemblies().FirstOrDefault(a => a.GetName().Name == "Jellyplus"));

    public static SeasonalStatus Evaluate(DateTime now, Assembly? jellyplus)
    {
        var date = DateOnly.FromDateTime(now);
        var validUntil = new DateTimeOffset(now.Date.AddDays(1)).ToUnixTimeMilliseconds();
        if (jellyplus is null)
            return new(date.Month == 10 ? "Halloween" : date.Month == 12 ? "Christmas" : "None", "Fallback", validUntil);

        // Use the installed plugin's actual date rules; do not duplicate its calendar.
        // This is an optional integration, without a required Jelly+ assembly reference.
        try
        {
            var season = jellyplus.GetType("Jellyplus.Rules")?.GetMethod("Season", [typeof(DateOnly)]);
            if (season is null || !season.IsStatic) return new("None", "Jelly+ unavailable", validUntil);
            var name = season.Invoke(null, [date]) as string;
            return new(name switch { "Halloween" => "Halloween", "Weihnachten" or "Christmas" => "Christmas", _ => "None" },
                "Jelly+", validUntil);
        }
        catch (Exception ex) when (ex is TargetInvocationException or ArgumentException or MemberAccessException)
        {
            // An installed but incompatible plugin must not activate a different season.
            return new("None", "Jelly+ unavailable", validUntil);
        }
    }
}

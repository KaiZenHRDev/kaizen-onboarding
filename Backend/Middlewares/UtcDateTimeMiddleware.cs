using System.Text.Json;
using System.Text.Json.Serialization;

namespace RecruitmentBackend.Middlewares
{
    public class UtcDateTimeMiddleware
    {
        private readonly RequestDelegate _next;

        public UtcDateTimeMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (context.Request.ContentType?.Contains("application/json") == true)
            {
                using var reader = new StreamReader(context.Request.Body);
                var body = await reader.ReadToEndAsync();

                if (!string.IsNullOrWhiteSpace(body))
                {
                    var options = new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true,
                        Converters = { new DateTimeToUtcConverter() }
                    };

                    var jsonElement = JsonSerializer.Deserialize<JsonElement>(body, options);
                    var normalizedBody = JsonSerializer.Serialize(jsonElement, options);

                    var bytes = System.Text.Encoding.UTF8.GetBytes(normalizedBody);
                    context.Request.Body = new MemoryStream(bytes);
                }
            }

            await _next(context);
        }
    }

    public class DateTimeToUtcConverter : JsonConverter<DateTime>
    {
        public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            var date = reader.GetDateTime();
            return DateTime.SpecifyKind(date, DateTimeKind.Utc);
        }

        public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
        {
            writer.WriteStringValue(value.ToUniversalTime());
        }
    }
}

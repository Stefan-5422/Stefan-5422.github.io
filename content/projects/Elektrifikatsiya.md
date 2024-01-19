+++
title = "Elektrifikatsiya"
template = "page.html"
date = 2024-01-19
[taxonomies]
tags = ["webdev"]
[extra]
summary = "Managing smart plugs with style. (God what were we thinking with that name)"
+++

# Premise

Each year during our project-management class we spent about 1 semester worth of time on actually doing a project with the techniques we learnt that year, in this case agile scrum.

# The task

The task for this years project was to manage Smart-Plugs by the company Shelly.  
More specifically we needed to be able to do the following:

- Turning the device on/off
- Reading the power consumption of whatever is connected
- Calculating the cost over a certain time span
- Notify the user if a device goes over a certain load limit
- Notify the user if a device goes under a certain load limit
- Send a email to the user every day to update them on their power consumption

# The team

- [Friend](https://github.com/Friend2868)
- Me :)
- [Mienai](https://github.com/Aldin296)
- [Silas](https://github.com/Silas7373)
- [Stone_Red](https://me.stone-red.net)

# Technologies

- Asp.NET
- DotNET
- C#
- Grafana
- Mosquitto
- SQLite

This is where worst decision in the entire project came to be: Using Prometheus as a Database. While Prometheus is a great database for data collection in case you want to visualize it with Grafana it really isn't the best for using it in your own application. What made this decission even worse is that we didn't even really use Prometheus's powerful collecting tool instead putting another service in between which was responsible for taking the MQTT messages and putting it into a Prometheus readable format.

# Architecture

While it got quite complicated and a bit convoluted with all of the services talking to each other at the end, I still think the Architecture was quite ok.

> ![Image of the final software architecture](/images/projects/ElektrifikatsiyaArchitecture.png)
> Image of the final software architecture

But I guess I should probably explain a bit about how everything communicated with each other.

#### Device Services

In the end we ended up with 3 different Services which manage some part of the Devices data and all of them have a reason to exist, I mean you could probably merge some of them without it becoming too messy but this just seemed to be the cleanest way at the time.

##### Device Management Service

This service exposes CRUD functions to interact with the Devices using the DeviceStatus service in order accomplish this. The reason for splitting those 2 is so that the data flowing from our Dashboard does not conflict with the data coming from the outside world.

##### Device Status Service

This service really only serves two purpose to notify the rest of the App about changes to devices and to decouple the data from the database (by copying it), granted this really could have been part of the other services but this just made it look cleaner.

##### Update Service

This service gathers data from Prometheus and transforms it into a format we can deal with then updates the device using the Status service so the updated data shows up in the Dashboard.

#### Energy Price

Did I say 3 services well technically this one also updates the devices so lets make it 4 just to be safe.

This is probably the most complicated service in the entire project, it first looks at the SQL-Database in order to find all the energy price changes the user entered and then for the time the price was valid calculates the amount of power used in that time period.

Here Prometheus actually did come in useful because we could simply tell it to perform the calculations in our services stead so it doesn't take as much power, or so we thought. Prometheus on the other hand didn't really enjoy this treatment and at points liked to take up to 11GB of RAM and 11CPU cores at full blast.
Did I ever mention using Prometheus wasn't our greatest idea.

# Interesting code segments

#### Prometheus

You didn't think after all that rambling about how terrible a choice it was to use Prometheus I wasn't going to at least show off the code that made me question all decisions leading up to that point.

The query itself is relatively normal just sending a request to the query API of Prometheus.

```cs
public Task<PrometheusQueryResult?> Query(string query)
{
	Debug.WriteLine($"{client.BaseAddress}/api/v1/query?query={query}");
	return client.GetFromJsonAsync<PrometheusQueryResult>($"/api/v1/query?query={UrlEncoder.Create().Encode(query)}", new JsonSerializerOptions()
	{
		PropertyNameCaseInsensitive = true,
		Converters =
		{
			new JsonStringEnumConverter()
		}
	});
}

public class PrometheusQueryResult
{
    public Status Status { get; set; }

    public string? ErrorType { get; set; }
    public string? Error { get; set; }
    public List<string>? Warnings { get; set; }

    public PrometheusDataWrapper? Data { get; set; }

    public PrometheusQueryResult(Status status, string? errorType, string? error, List<string>? warnings)
    {
        Status = status;
        ErrorType = errorType;
        Error = error;
        Warnings = warnings;
    }
}
```

But actually dealing with the results is where it gets fun, because Prometheus helpfully has a bunch of different types which returning data can assume. So feast your eyes on some of the atrocious code which actually passes this stuff:

```cs
public FluentResults.Result<List<(double, double)>> MatrixTypeToTimestampFloatTuple()
    {
        if (ResultType != ResultType.Matrix)
        {
            return FluentResults.Result.Fail("The response did not have the Matrix Type");
        }

        List<(double, double)> result = new List<(double, double)>();

        if (Result.Count == 0 || Result[0]?.Values is null || Result[0]?.Values?[0] is null)
        {
            return FluentResults.Result.Fail("There was no result in the Response Body");
        }

        foreach (object value in Result[0]!.Values!)
        {

            string[] segment = value.ToString()!.Split(",");

            result.Add((Convert.ToDouble(segment[0][2..^1], CultureInfo.InvariantCulture), Convert.ToDouble(segment[1][1..^2], CultureInfo.InvariantCulture)));
        }
        Debug.WriteLine(result);
        return result;
    }
```

Looking back at it the code doesn't actually look that terrible but it is the least stable part of the entire application and any attempts I have made to clean it up have resulted in the entire thing breaking, as such I have just decided to leave it like this.

#### Cost calculation

Speaking of terrible and unreliable code calculating the cost of the energy price is also a nightmare because we started to run out of time and needed to get everything done so this code ended up being a big mess as well.

```cs
(await prometheusQuerier.Query($$"""sum_over_time(sum(power{sensor=~"{{plugnames}}"})[{{duration}}{{(inMinutes ? "m" : "d")}}:1s] @ {{timestamp}}) * {{(price / 3600).ToString(CultureInfo.InvariantCulture)}}"""))?.Data?.VectorTypeToTimestampFloatTuple().ValueOrDefault.Item2 ?? 0;
```

The line above is the actual query sent to Prometheus, its hideous and honestly probably the worst piece of code I have ever written, especially considering this code calculates the energy demand back by an entire year, with a step width of 1s! Which is 31579200steps! No wonder the DB was dying.

# Conclusion

Even knowing all I really did in this writeup was whine about how bad the project was and what a terrible idea choosing Prometheus was we ended up fulfilling most of the requirements. We kind of forgot about the whole notifying the user depending on load thing but in the end it didn't matter because we got an A.

Thanks to Stone_Red for helping me dig through the code and figure out why we did things the way we did

and thanks to the rest of the team for making the project with me, it was fun!
